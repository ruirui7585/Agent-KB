export async function polishAnnotation(input) {
  const text = (input || "").trim();
  const hasLock = /锁|锁定|限制|不可|不能|禁用/.test(text);
  const hasToast = /toast|提示|弹窗|提醒/.test(text);
  const hasAccept = /接受|同意|通过/.test(text);
  return {
    functionDescription: text ? `该规则用于说明当前标注区域在业务流程中的展示、权限和操作反馈。原始事实：${text}` : "请先填写人工事实，再生成产品说明。",
    displayCondition: hasAccept ? "与消息请求接受状态相关；接受前后展示和可操作能力可能不同。" : "在当前功能与场景命中时展示。",
    interactionRule: hasLock ? "当命中限制条件时，入口保持可见但应表现为锁定或不可继续操作。" : "用户点击后按当前场景规则继续流程，并给出明确反馈。",
    notes: hasToast ? "涉及 Toast 或轻提示时，需要确认触发时机、文案和消失规则。" : "当前为本地规则模拟，后续可接入大模型 API 做更完整校验。"
  };
}

export async function findMissingRules(projectData) {
  const checks = ["默认状态", "成功状态", "失败状态", "权限限制", "空状态", "异常状态"];
  const allText = JSON.stringify(projectData || {});
  return checks.filter((item) => !allText.includes(item));
}

export async function checkRuleConflicts(projectData) {
  const text = JSON.stringify(projectData || {});
  const pairs = [
    ["隐藏", "展示"],
    ["锁定", "可点击"],
    ["免费", "扣费"],
    ["不可用", "可用"],
    ["已拒绝", "已接受"]
  ];
  return pairs
    .filter(([a, b]) => text.includes(a) && text.includes(b))
    .map(([a, b]) => `检测到「${a}」和「${b}」同时出现，请确认是否属于不同场景，或是否存在规则冲突。`);
}
