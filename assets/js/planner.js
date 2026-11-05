(() => {
  const kind = document.body.dataset.planner;
  const projects = kind === "projects";
  const label = projects ? "项目" : "日程";
  const key = "zaiye-planner-" + kind + "-v1";
  const form = document.querySelector("form");
  const list = document.querySelector("[data-records]");
  const message = document.querySelector("[data-message]");
  const heading = document.querySelector("#form-title");
  const cancel = document.querySelector("[data-cancel]");
  let records = [], editing = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(saved)) throw Error();
    records = saved;
  } catch {
    message.textContent = "无法读取本地记录。为避免覆盖，请先检查浏览器存储设置。";
    form.querySelectorAll("input,select,textarea,button").forEach(node => node.disabled = true);
    return;
  }
  function save(next, notice) {
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { message.textContent = "保存失败，浏览器可能禁用了存储或空间不足。"; return false; }
    records = next;
    render();
    message.textContent = notice;
    return true;
  }
  function reset() {
    editing = null;
    form.reset();
    heading.textContent = "新增" + label;
    cancel.hidden = true;
  }
  function action(text, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", handler);
    return button;
  }
  function render() {
    list.replaceChildren();
    const sorted = [...records].sort((a,b) =>
      (a.date || "9999").localeCompare(b.date || "9999") || (a.time || "").localeCompare(b.time || ""));
    if (!sorted.length) {
      const empty = document.createElement("li");
      empty.textContent = "还没有" + label + "。";
      list.append(empty);
    }
    for (const record of sorted) {
      const item = document.createElement("li");
      const title = document.createElement("h3");
      title.textContent = record.title;
      const detail = document.createElement("p");
      detail.textContent = [record.date && (projects ? "截止 " : "") + record.date, record.time, record.status].filter(Boolean).join(" · ");
      const notes = document.createElement("p");
      notes.textContent = record.notes;
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(action("编辑", () => {
        editing = record.id;
        for (const name of ["title","date","notes","status","time"]) {
          const field = form.elements.namedItem(name);
          if (field) field.value = record[name] || "";
        }
        heading.textContent = "编辑" + label;
        cancel.hidden = false;
        form.elements.namedItem("title").focus();
      }), action("删除", () => {
        if (confirm("删除「" + record.title + "」？") &&
            save(records.filter(row => row.id !== record.id), "已删除" + label + "。") &&
            editing === record.id) reset();
      }));
      item.append(title);
      if (detail.textContent) item.append(detail);
      if (record.notes) item.append(notes);
      item.append(actions);
      list.append(item);
    }
  }
  cancel.addEventListener("click", reset);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.title = data.title.trim();
    if (!data.title) {
      message.textContent = "请输入" + label + "名称。";
      form.elements.namedItem("title").focus();
      return;
    }
    const record = { ...data, id: editing || crypto.randomUUID() };
    const next = editing ? records.map(row => row.id === editing ? record : row) : [...records, record];
    if (save(next, "已保存" + label + "。")) reset();
  });
  render();
})();
