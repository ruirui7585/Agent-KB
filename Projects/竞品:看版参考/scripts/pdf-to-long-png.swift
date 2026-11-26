import Foundation
import PDFKit
import AppKit

// 将飞书导出的 PDF 文档渲染拼接为一张超清完整长图 PNG（最多拼接前 12 页防止内存溢出）
let args = Array(CommandLine.arguments.dropFirst())
guard args.count >= 2 else {
    fputs("Usage: swift pdf-to-long-png.swift <input.pdf> <output.png>\n", stderr)
    exit(1)
}

let pdfURL = URL(fileURLWithPath: args[0])
let outURL = URL(fileURLWithPath: args[1])

guard let doc = PDFDocument(url: pdfURL), doc.pageCount > 0 else {
    fputs("Failed to open PDF\n", stderr)
    exit(1)
}

let maxPages = min(doc.pageCount, 12)
let targetWidth: CGFloat = 1800.0
var pageRects: [CGRect] = []
var scaledHeights: [Int] = []

for i in 0..<maxPages {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let scale = targetWidth / max(1.0, box.width)
    pageRects.append(box)
    scaledHeights.append(max(40, Int((box.height * scale).rounded())))
}

let gap = 4
let totalHeight = scaledHeights.reduce(0, +) + max(0, scaledHeights.count - 1) * gap
let outWidth = Int(targetWidth)

guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
      let ctx = CGContext(
          data: nil,
          width: outWidth,
          height: totalHeight,
          bitsPerComponent: 8,
          bytesPerRow: 0,
          space: colorSpace,
          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
      ) else {
    fputs("Failed to create CGContext\n", stderr)
    exit(1)
}

// 白色底画布
ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
ctx.fill(CGRect(x: 0, y: 0, width: outWidth, height: totalHeight))

// CGContext 原点在左下角，第一页绘制在最上方
var currentTop = totalHeight
for i in 0..<pageRects.count {
    guard let page = doc.page(at: i) else { continue }
    let box = pageRects[i]
    let h = scaledHeights[i]
    let yBottom = currentTop - h

    ctx.saveGState()
    ctx.translateBy(x: 0, y: CGFloat(yBottom))
    let scale = targetWidth / max(1.0, box.width)
    ctx.scaleBy(x: scale, y: scale)
    page.draw(with: .mediaBox, to: ctx)
    ctx.restoreGState()

    if i + 1 < pageRects.count {
        ctx.setFillColor(CGColor(red: 0.88, green: 0.91, blue: 0.94, alpha: 1))
        ctx.fill(CGRect(x: 0, y: yBottom - gap, width: outWidth, height: gap))
    }
    currentTop = yBottom - gap
}

guard let cgImage = ctx.makeImage() else {
    fputs("Failed to render PDF image\n", stderr)
    exit(1)
}

let rep = NSBitmapImageRep(cgImage: cgImage)
guard let pngData = rep.representation(using: .png, properties: [:]) else {
    fputs("Failed to encode PNG\n", stderr)
    exit(1)
}

try pngData.write(to: outURL)
print("{\"ok\":true,\"pageCount\":\(pageRects.count),\"width\":\(outWidth),\"height\":\(totalHeight)}")
