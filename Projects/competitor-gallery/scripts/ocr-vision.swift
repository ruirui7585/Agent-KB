import Foundation
import Vision
import AppKit

struct OCRResultItem: Codable {
    let file: String
    let headerLines: [String]
    let bodyLines: [String]
    let footerLines: [String]
    let lines: [String]
    let fullText: String
}

func isMobileStatusBarNoise(_ text: String, topY: CGFloat, isPortraitPhone: Bool) -> Bool {
    if !isPortraitPhone || topY > 0.058 { return false }
    let t = text.trimmingCharacters(in: .whitespacesAndNewlines)
    let pattern = #"^([\d:\s«»<>.,|•\-]+|(5G|5GA|4G|LTE|Wi-?Fi|VPN|\d{1,3}%|\d{1,2}:\d{2}\d?|\s)+)+$"#
    if let re = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) {
        let range = NSRange(t.startIndex..<t.endIndex, in: t)
        if re.firstMatch(in: t, options: [], range: range) != nil {
            return true
        }
    }
    if t.contains("5GA") || t.contains("5G ") || t.contains("LTE") {
        return true
    }
    return false
}

func upscaleIfNeeded(_ cgImage: CGImage) -> CGImage {
    // 若宽屏截图分辨率偏低（如缩略图 < 1500px），内存放大 2 倍提升小号中英文识别率
    if cgImage.width >= 1500 || cgImage.width <= cgImage.height {
        return cgImage
    }
    let newW = cgImage.width * 2
    let newH = cgImage.height * 2
    guard let colorSpace = cgImage.colorSpace ?? CGColorSpace(name: CGColorSpace.sRGB),
          let ctx = CGContext(
              data: nil,
              width: newW,
              height: newH,
              bitsPerComponent: 8,
              bytesPerRow: 0,
              space: colorSpace,
              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
          ) else {
        return cgImage
    }
    ctx.interpolationQuality = .high
    ctx.draw(cgImage, in: CGRect(x: 0, y: 0, width: newW, height: newH))
    return ctx.makeImage() ?? cgImage
}

func containsArabic(_ s: String) -> Bool {
    for scalar in s.unicodeScalars {
        if (0x0600...0x06FF).contains(scalar.value) || (0x0750...0x077F).contains(scalar.value) {
            return true
        }
    }
    return false
}

func recognizeImage(at path: String) -> OCRResultItem {
    let url = URL(fileURLWithPath: path)
    guard let image = NSImage(contentsOf: url),
          let rawCG = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        return OCRResultItem(file: path, headerLines: [], bodyLines: [], footerLines: [], lines: [], fullText: "")
    }

    let isPortraitPhone = Double(rawCG.height) / Double(max(1, rawCG.width)) >= 1.55
    let cgImage = upscaleIfNeeded(rawCG)

    // 主通道：专注中文 + 英文（杜绝小字号下误出日文/泰文乱码）
    let reqZhEn = VNRecognizeTextRequest()
    reqZhEn.recognitionLevel = .accurate
    reqZhEn.usesLanguageCorrection = true
    reqZhEn.recognitionLanguages = ["zh-Hans", "en-US"]

    // 阿语通道：专门捕获中东阿语文本行
    let reqAr = VNRecognizeTextRequest()
    reqAr.recognitionLevel = .accurate
    reqAr.usesLanguageCorrection = true
    reqAr.recognitionLanguages = ["ar-SA", "ars-SA", "en-US"]

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    do {
        try handler.perform([reqZhEn, reqAr])
    } catch {
        return OCRResultItem(file: path, headerLines: [], bodyLines: [], footerLines: [], lines: [], fullText: "")
    }

    struct TextBox {
        let text: String
        let midY: CGFloat
        let minX: CGFloat
    }

    var boxes: [TextBox] = []
    var occupiedY: [CGFloat] = []

    for obs in (reqZhEn.results ?? []) {
        guard let top = obs.topCandidates(1).first, top.confidence >= 0.36 else { continue }
        let cleaned = top.string.trimmingCharacters(in: .whitespacesAndNewlines)
        if cleaned.isEmpty { continue }
        let bb = obs.boundingBox
        let topY = 1.0 - (bb.origin.y + bb.size.height * 0.5)
        if isMobileStatusBarNoise(cleaned, topY: topY, isPortraitPhone: isPortraitPhone) {
            continue
        }
        boxes.append(TextBox(text: cleaned, midY: topY, minX: bb.origin.x))
        occupiedY.append(topY)
    }

    // 补充阿语通道识别出的真实阿语词句
    for obs in (reqAr.results ?? []) {
        guard let top = obs.topCandidates(1).first, top.confidence >= 0.38 else { continue }
        let cleaned = top.string.trimmingCharacters(in: .whitespacesAndNewlines)
        if !containsArabic(cleaned) { continue }
        let bb = obs.boundingBox
        let topY = 1.0 - (bb.origin.y + bb.size.height * 0.5)
        let alreadyCovered = occupiedY.contains { abs($0 - topY) < 0.012 }
        if !alreadyCovered {
            boxes.append(TextBox(text: cleaned, midY: topY, minX: bb.origin.x))
        }
    }

    boxes.sort { a, b in
        if abs(a.midY - b.midY) < 0.013 {
            return a.minX < b.minX
        }
        return a.midY < b.midY
    }

    struct MergedRow {
        let text: String
        let midY: CGFloat
    }

    var rows: [MergedRow] = []
    var currentGroup: [TextBox] = []

    let flushGroup = {
        if !currentGroup.isEmpty {
            let sortedRow = currentGroup.sorted { $0.minX < $1.minX }
            let avgY = sortedRow.map { $0.midY }.reduce(0, +) / CGFloat(sortedRow.count)
            let rowText = sortedRow.map { $0.text }.joined(separator: "  ")
            if !isMobileStatusBarNoise(rowText, topY: avgY, isPortraitPhone: isPortraitPhone) {
                rows.append(MergedRow(text: rowText, midY: avgY))
            }
            currentGroup = []
        }
    }

    for box in boxes {
        if let last = currentGroup.last, abs(box.midY - last.midY) < 0.013 {
            currentGroup.append(box)
        } else {
            flushGroup()
            currentGroup = [box]
        }
    }
    flushGroup()

    var headerLines: [String] = []
    var bodyLines: [String] = []
    var footerLines: [String] = []

    for r in rows {
        if isPortraitPhone && r.midY <= 0.155 {
            headerLines.append(r.text)
        } else if isPortraitPhone && r.midY >= 0.885 {
            footerLines.append(r.text)
        } else {
            bodyLines.append(r.text)
        }
    }

    let allLines = rows.map { $0.text }
    return OCRResultItem(
        file: path,
        headerLines: headerLines,
        bodyLines: bodyLines,
        footerLines: footerLines,
        lines: allLines,
        fullText: allLines.joined(separator: "\n")
    )
}

let args = Array(CommandLine.arguments.dropFirst())
var output: [String: OCRResultItem] = [:]

for arg in args {
    output[arg] = recognizeImage(at: arg)
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.withoutEscapingSlashes]
if let data = try? encoder.encode(output),
   let jsonStr = String(data: data, encoding: .utf8) {
    print(jsonStr)
} else {
    print("{}")
}
