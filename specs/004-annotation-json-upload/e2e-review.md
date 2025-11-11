# E2E Review: Annotation JSON Upload Feature

## 🎯 流程分析

### **正常流程 (Happy Path)**

```
1. 用户上传 VTT 文件
   ├─ parseFile() → cues[] (5 cues, all importance=undefined)
   ├─ UI 显示: "Processed 5 cues"
   └─ JSON 上传区域显示

2. 用户上传 annotation.json
   ├─ handleAnnotationImport() 触发
   ├─ importAnnotations(jsonText, cues) 调用
   │  ├─ targetCues = cues (从参数)
   │  ├─ parseAnnotationJson() → 验证结构 ✓
   │  ├─ matchAnnotationsToCues() → 时间匹配 ✓
   │  ├─ updatedCues = [...cues] (深拷贝)
   │  ├─ applyAnnotationsToCues(annotations, updatedCues)
   │  ├─ currentSession = null → 跳过 session 更新
   │  └─ return { success: true, updatedCues }
   ├─ setImportedCues(updatedCues) ✓
   └─ UI 显示: "Successfully imported X annotation(s)"

3. 用户点击 "Start Annotating Now"
   ├─ createSession(importedCues || cues, fileName, rawContent)
   │  └─ cues: [...importedCues] (带 annotations)
   └─ Session 创建成功，annotations 已加载 ✓
```

### **边界情况 (Edge Cases)**

#### ✅ **Case 1: 用户重新上传 VTT**
```typescript
handleFileSelect() {
  setImportedCues(null);        // ✓ 清除旧的 imported cues
  setImportFeedback(...);        // ✓ 清除反馈消息
  await parseFile(file);         // ✓ 解析新文件
}
```

#### ✅ **Case 2: JSON 文件格式错误**
```typescript
parseAnnotationJson() {
  if (!parsed.annotations) {
    return { error: 'Missing or invalid annotations array' }; // ✓
  }
}
```

#### ✅ **Case 3: 时间不匹配**
```typescript
matchAnnotationsToCues() {
  if (matchingCueIndices.length === 0) {
    issues.push({ type: 'UNMATCHED', ... }); // ✓
  }
  return { kind: 'error', issues }; // ✓
}
```

#### ✅ **Case 4: 已有 annotations 的覆盖确认**
```typescript
importAnnotations() {
  if (hasExistingAnnotations) {
    const confirmed = window.confirm('...overwrite...'); // ✓
    if (!confirmed) return { success: false, ... };
  }
}
```

#### ✅ **Case 5: UI 层面防护**
```tsx
{cues.length > 0 && !currentSession && (
  // JSON 上传组件只在有 cues 且无 session 时显示 ✓
)}
```

## 🔍 关键代码审查

### **1. importAnnotations 函数签名**
```typescript
// ✓ 正确: 接受可选的 targetCues 参数
const importAnnotations = useCallback((
  jsonText: string, 
  targetCues?: TranscriptCue[]
): { 
  success: boolean; 
  message: string; 
  issues?: Array<...>; 
  updatedCues?: TranscriptCue[] // ✓ 正确: 返回更新后的 cues
} => {
```

### **2. cues 处理逻辑**
```typescript
// ✓ 正确: 优先使用传入的 targetCues
const cues = targetCues || currentSession?.cues;

// ✓ 正确: 深拷贝避免直接修改原数组
const updatedCues = [...cues];
applyAnnotationsToCues(parsed.annotations, updatedCues);

// ✓ 正确: 只在 session 存在时更新 session
if (currentSession) {
  setCurrentSession(prevSession => ...);
}

// ✓ 正确: 总是返回 updatedCues
return { success: true, message: '...', updatedCues };
```

### **3. App.tsx 中的状态管理**
```typescript
// ✓ 正确: 独立的 state 存储 imported cues
const [importedCues, setImportedCues] = useState<TranscriptCue[] | null>(null);

// ✓ 正确: 成功时存储 updatedCues
if (result.success && result.updatedCues) {
  setImportedCues(result.updatedCues);
}

// ✓ 正确: 创建 session 时优先使用 importedCues
createSession(importedCues || cues, ...)

// ✓ 正确: 重新上传 VTT 时清除
setImportedCues(null);
```

## 📋 测试清单

### **手动测试步骤**

1. **正常流程**
   - [ ] 上传 `test-sample.vtt`
   - [ ] 验证显示 "Processed 5 cues"
   - [ ] 上传 `test-annotation.json`
   - [ ] 验证显示 "Successfully imported 3 annotation(s) (partial coverage)"
   - [ ] 点击 "Start Annotating Now"
   - [ ] 验证前 3 个 cue 已有 importance (1, 2, 3)
   - [ ] 验证后 2 个 cue 仍为 unknown

2. **重新上传 VTT**
   - [ ] 完成步骤 1
   - [ ] 重新上传一个新的 VTT 文件
   - [ ] 验证之前的 import feedback 消失
   - [ ] 验证可以重新上传 JSON

3. **错误处理**
   - [ ] 上传格式错误的 JSON (缺少 annotations 字段)
   - [ ] 验证显示错误: "Missing or invalid annotations array"
   - [ ] 上传时间不匹配的 JSON
   - [ ] 验证显示错误: "Import failed: X issue(s) found"

4. **覆盖确认**
   - [ ] 创建一个 session 并手动标注几个 cue
   - [ ] 返回上传页面 (Back to Upload)
   - [ ] 上传 annotation JSON
   - [ ] 验证弹出确认对话框
   - [ ] 取消 → 验证没有覆盖
   - [ ] 再次上传并确认 → 验证成功覆盖

## ✅ Review 结论

### **代码质量**
- ✅ 逻辑清晰，职责分离良好
- ✅ 错误处理完善
- ✅ 状态管理正确
- ✅ 边界情况已覆盖
- ✅ 用户体验考虑周到 (feedback, confirmation)

### **潜在改进 (非阻塞)**
- 可以添加更多单元测试覆盖 edge cases
- 可以添加 loading 状态在处理大文件时
- 可以添加更详细的 validation 错误信息

### **Ready for Testing** ✅
代码逻辑正确，可以进行手动测试。
