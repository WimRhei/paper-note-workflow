var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// archiver.js
var require_archiver = __commonJS({
  "archiver.js"(exports2, module2) {
    var { Notice: Notice2 } = require("obsidian");
    async function scanInbox2(vault, inboxPath) {
      const exists = await vault.adapter.exists(inboxPath);
      if (!exists) {
        new Notice2(`Inbox \u76EE\u5F55\u4E0D\u5B58\u5728: ${inboxPath}`);
        return [];
      }
      const listing = await vault.adapter.list(inboxPath);
      const folders = listing.folders || [];
      const papers = [];
      for (const folderPath of folders) {
        const folderName = folderPath.split("/").pop();
        if (folderName.startsWith(".")) continue;
        const mdPath = `${folderPath}/${folderName}.md`;
        const hasMd = await vault.adapter.exists(mdPath);
        if (!hasMd) {
          continue;
        }
        const mdContent = await vault.adapter.read(mdPath);
        const allFiles = await collectFilesRecursive(vault, folderPath);
        const refFilenames = parseAttachmentRefs(mdContent);
        const { referenced, unreferenced } = classifyFiles(
          allFiles,
          folderPath,
          refFilenames,
          mdPath
        );
        papers.push({
          name: folderName,
          folderPath,
          mdPath,
          mdContent,
          allFiles,
          referencedFiles: referenced,
          unreferencedFiles: unreferenced
        });
      }
      return papers;
    }
    function parseAttachmentRefs(content) {
      const refs = /* @__PURE__ */ new Set();
      const wikiEmbedRegex = /!\[\[([^\]]+)\]\]/g;
      for (const m of content.matchAll(wikiEmbedRegex)) {
        let ref = m[1];
        ref = ref.split("|")[0].trim();
        ref = ref.split("#")[0].trim();
        refs.add(ref.split("/").pop());
      }
      const wikiLinkRegex = /(?<!!)\[\[([^\]]+)\]\]/g;
      for (const m of content.matchAll(wikiLinkRegex)) {
        let ref = m[1];
        ref = ref.split("|")[0].trim();
        ref = ref.split("#")[0].trim();
        refs.add(ref.split("/").pop());
      }
      const mdImageRegex = /!\[.*?\]\(([^)]+)\)/g;
      for (const m of content.matchAll(mdImageRegex)) {
        let ref = m[1].trim();
        if (!ref.startsWith("http")) {
          refs.add(ref.split("/").pop());
        }
      }
      const mdLinkRegex = /(?<!!)\[.*?\]\(([^)]+)\)/g;
      for (const m of content.matchAll(mdLinkRegex)) {
        let ref = m[1].trim();
        if (!ref.startsWith("http")) {
          refs.add(ref.split("/").pop());
        }
      }
      return [...refs];
    }
    function classifyFiles(allFiles, folderPath, refFilenames, mdPath) {
      const referenced = [];
      const unreferenced = [];
      const paperName = folderPath.split("/").pop();
      for (const filePath of allFiles) {
        if (filePath === mdPath) continue;
        const basename = filePath.split("/").pop();
        const ext = (basename.split(".").pop() || "").toLowerCase();
        if (basename === `${paperName}-naive.md` || basename === `${paperName}.txt`) {
          unreferenced.push(filePath);
          continue;
        }
        if (["pdf", "md"].includes(ext)) {
          referenced.push(filePath);
          continue;
        }
        if (refFilenames.includes(basename)) {
          referenced.push(filePath);
        } else {
          unreferenced.push(filePath);
        }
      }
      return { referenced, unreferenced };
    }
    async function collectFilesRecursive(vault, dirPath) {
      const files = [];
      const listing = await vault.adapter.list(dirPath);
      files.push(...listing.files || []);
      for (const subFolder of listing.folders || []) {
        files.push(...await collectFilesRecursive(vault, subFolder));
      }
      return files;
    }
    async function archivePaper(vault, paper, targetTopic, outputRoot) {
      const errors = [];
      const topicDir = `${outputRoot}/${targetTopic}`;
      const figureDir = `${topicDir}/Figure`;
      const pdfDir = `${topicDir}/PDF`;
      try {
        await ensureDir(vault, topicDir);
        await ensureDir(vault, figureDir);
        await ensureDir(vault, pdfDir);
        const targetMd = `${topicDir}/${paper.name}.md`;
        const attachmentDestByName = buildAttachmentDestMap(paper.referencedFiles);
        const rewrittenMd = rewriteAttachmentRefs(paper.mdContent, attachmentDestByName);
        await writeTextFile(vault, targetMd, rewrittenMd);
        await vault.adapter.remove(paper.mdPath);
        for (const filePath of paper.referencedFiles) {
          const basename = filePath.split("/").pop();
          const ext = (basename.split(".").pop() || "").toLowerCase();
          let destDir;
          if (ext === "pdf") {
            destDir = pdfDir;
          } else if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(ext)) {
            destDir = figureDir;
          } else {
            destDir = topicDir;
          }
          try {
            if (ext === "md") {
              const content = await vault.adapter.read(filePath);
              const rewritten = rewriteAttachmentRefs(content, attachmentDestByName);
              await writeTextFile(vault, `${destDir}/${basename}`, rewritten);
              await vault.adapter.remove(filePath);
            } else {
              await moveFile(vault, filePath, `${destDir}/${basename}`);
            }
          } catch (e) {
            errors.push(`\u79FB\u52A8\u5931\u8D25: ${basename} \u2014 ${e.message}`);
          }
        }
        for (const filePath of paper.unreferencedFiles) {
          try {
            await vault.adapter.remove(filePath);
          } catch (e) {
            errors.push(`\u5220\u9664\u5931\u8D25: ${filePath} \u2014 ${e.message}`);
          }
        }
        await cleanupEmptyDirs(vault, paper.folderPath);
        return {
          success: errors.length === 0,
          targetPath: targetMd,
          errors
        };
      } catch (e) {
        return {
          success: false,
          targetPath: topicDir,
          errors: [...errors, `\u5F52\u6863\u5F02\u5E38: ${e.message}`]
        };
      }
    }
    async function ensureDir(vault, dirPath) {
      if (!await vault.adapter.exists(dirPath)) {
        await vault.adapter.mkdir(dirPath);
      }
    }
    async function moveFile(vault, srcPath, destPath) {
      if (await vault.adapter.exists(destPath)) {
        await vault.adapter.remove(destPath);
      }
      const content = await vault.adapter.readBinary(srcPath);
      const destDir = destPath.substring(0, destPath.lastIndexOf("/"));
      await ensureDir(vault, destDir);
      await vault.adapter.writeBinary(destPath, content);
      await vault.adapter.remove(srcPath);
    }
    function buildAttachmentDestMap(filePaths) {
      const map = /* @__PURE__ */ new Map();
      for (const filePath of filePaths) {
        const basename = filePath.split("/").pop();
        const ext = (basename.split(".").pop() || "").toLowerCase();
        if (ext === "pdf") {
          map.set(basename, `PDF/${basename}`);
        } else if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(ext)) {
          map.set(basename, `Figure/${basename}`);
        } else {
          map.set(basename, basename);
        }
      }
      return map;
    }
    function rewriteAttachmentRefs(content, attachmentDestByName) {
      const rewriteTarget = (rawTarget) => {
        const trimmed = rawTarget.trim();
        if (!trimmed || /^(https?:|mailto:|obsidian:|#)/i.test(trimmed)) {
          return rawTarget;
        }
        const basename = trimmed.split(/[\\/]/).pop();
        return attachmentDestByName.get(basename) || rawTarget;
      };
      return content.replace(/(!?\[\[)([^\]|#]+)((?:#[^\]|]+)?(?:\|[^\]]+)?)\]\]/g, (_m, open, target, suffix) => {
        return `${open}${rewriteTarget(target)}${suffix}]]`;
      }).replace(/(!?\[[^\]]*?\]\()([^)]+)(\))/g, (_m, open, target, close) => {
        return `${open}${rewriteTarget(target)}${close}`;
      });
    }
    async function writeTextFile(vault, destPath, content) {
      if (await vault.adapter.exists(destPath)) {
        await vault.adapter.remove(destPath);
      }
      const destDir = destPath.substring(0, destPath.lastIndexOf("/"));
      await ensureDir(vault, destDir);
      await vault.adapter.write(destPath, content);
    }
    async function cleanupEmptyDirs(vault, dirPath) {
      try {
        if (!await vault.adapter.exists(dirPath)) return;
        const listing = await vault.adapter.list(dirPath);
        const hasFiles = (listing.files || []).length > 0;
        const hasFolders = (listing.folders || []).length > 0;
        if (hasFolders) {
          for (const subfolder of listing.folders) {
            await cleanupEmptyDirs(vault, subfolder);
          }
        }
        const relisting = await vault.adapter.list(dirPath);
        const isEmpty = (relisting.files || []).length === 0 && (relisting.folders || []).length === 0;
        if (isEmpty) {
          await vault.adapter.rmdir(dirPath, false);
        }
      } catch (_e) {
      }
    }
    module2.exports = {
      scanInbox: scanInbox2,
      parseAttachmentRefs,
      classifyFiles,
      archivePaper,
      cleanupEmptyDirs
    };
  }
});

// modal.js
var require_modal = __commonJS({
  "modal.js"(exports2, module2) {
    var { Modal, Notice: Notice2 } = require("obsidian");
    var { archivePaper } = require_archiver();
    var BatchArchiveModal2 = class extends Modal {
      constructor(app, plugin, papers, settings) {
        super(app);
        this.plugin = plugin;
        this.papers = papers;
        this.settings = settings;
        this.selections = {};
        this.includeFlags = {};
        this.existingTopics = [];
      }
      async onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("paper-archiver-modal");
        const header = contentEl.createDiv("pa-header");
        const headerLeft = header.createDiv("pa-header-left");
        headerLeft.createSpan({ text: "\u{1F4E6}", cls: "pa-header-icon" });
        headerLeft.createEl("h2", { text: "\u8BBA\u6587\u5F52\u6863" });
        header.createSpan({
          text: `${this.papers.length} papers`,
          cls: "pa-badge-count"
        });
        await this.scanTopics();
        const paperList = contentEl.createDiv("paper-archiver-list");
        for (const paper of this.papers) {
          this.includeFlags[paper.name] = true;
          this.selections[paper.name] = {
            topic: this.existingTopics.length > 0 ? this.existingTopics[0] : "",
            isNew: this.existingTopics.length === 0,
            newTopicName: ""
          };
          this.createPaperRow(paperList, paper);
        }
        const footer = contentEl.createDiv("pa-footer");
        footer.createSpan({
          text: "Select papers and target topics, then archive.",
          cls: "pa-footer-hint"
        });
        const cancelBtn = footer.createEl("button", {
          text: "Cancel",
          cls: "pa-btn pa-btn-secondary"
        });
        cancelBtn.addEventListener("click", () => this.close());
        const execBtn = footer.createEl("button", {
          text: "Archive papers",
          cls: "pa-btn pa-btn-primary"
        });
        execBtn.addEventListener("click", () => this.executeArchive());
      }
      async scanTopics() {
        const outputRoot = this.settings.defaultOutputRoot;
        if (!await this.app.vault.adapter.exists(outputRoot)) {
          this.existingTopics = [];
          return;
        }
        const listing = await this.app.vault.adapter.list(outputRoot);
        const exclude = /* @__PURE__ */ new Set(["Inbox", ".obsidian", "\u5F85\u8BFB\u8BBA\u6587.md"]);
        this.existingTopics = (listing.folders || []).map((f) => f.split("/").pop()).filter((name) => !exclude.has(name) && !name.startsWith(".")).sort();
      }
      createPaperRow(container, paper) {
        const card = container.createDiv("pa-card");
        const cardHeader = card.createDiv("pa-card-header");
        const title = cardHeader.createDiv("pa-card-title");
        title.createSpan({ text: "\u{1F4C4}", cls: "pa-card-icon" });
        title.createSpan({ text: paper.name, cls: "pa-card-name" });
        const toggleLabel = cardHeader.createEl("label", "pa-toggle");
        const toggleInput = toggleLabel.createEl("input", { type: "checkbox" });
        toggleInput.checked = true;
        toggleLabel.createSpan("pa-toggle-slider");
        toggleInput.addEventListener("change", () => {
          this.includeFlags[paper.name] = toggleInput.checked;
          if (toggleInput.checked) {
            card.removeClass("excluded");
          } else {
            card.addClass("excluded");
          }
        });
        const body = card.createDiv("pa-card-body");
        const topicRow = body.createDiv("pa-topic-row");
        topicRow.createSpan({ text: "Topic", cls: "pa-label" });
        const dropdownWrap = topicRow.createDiv("pa-dropdown-wrap");
        const dropdownBtn = dropdownWrap.createDiv("pa-dropdown-btn");
        const dropdownText = dropdownBtn.createSpan("pa-dropdown-text");
        const dropdownArrow = dropdownBtn.createSpan("pa-dropdown-arrow");
        dropdownArrow.setText("\u25BE");
        const dropdownPanel = dropdownWrap.createDiv("pa-dropdown-panel");
        dropdownPanel.style.display = "none";
        const selection = this.selections[paper.name];
        let selectedValue = this.existingTopics.length > 0 ? this.existingTopics[0] : "__new__";
        const newInput = topicRow.createEl("input", {
          type: "text",
          placeholder: "new-topic-name",
          cls: "pa-input"
        });
        const renderDropdown = () => {
          dropdownPanel.empty();
          for (const topic of this.existingTopics) {
            const opt = dropdownPanel.createDiv("pa-dropdown-option");
            opt.setText(topic);
            if (topic === selectedValue) opt.addClass("selected");
            opt.addEventListener("click", (e) => {
              e.stopPropagation();
              selectedValue = topic;
              selection.isNew = false;
              selection.topic = topic;
              selection.newTopicName = "";
              dropdownText.setText(topic);
              dropdownText.style.color = "";
              newInput.removeClass("visible");
              newInput.value = "";
              dropdownPanel.style.display = "none";
              dropdownArrow.setText("\u25BE");
              renderDropdown();
            });
          }
          const newOpt = dropdownPanel.createDiv("pa-dropdown-option pa-dropdown-new");
          newOpt.setText("+ New topic");
          if (selectedValue === "__new__") newOpt.addClass("selected");
          newOpt.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedValue = "__new__";
            selection.isNew = true;
            selection.topic = "";
            dropdownText.setText("+ New topic");
            dropdownText.style.color = "var(--text-muted)";
            newInput.addClass("visible");
            newInput.focus();
            dropdownPanel.style.display = "none";
            dropdownArrow.setText("\u25BE");
            renderDropdown();
          });
        };
        dropdownBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const show = dropdownPanel.style.display === "none";
          dropdownPanel.style.display = show ? "block" : "none";
          dropdownArrow.setText(show ? "\u25B4" : "\u25BE");
        });
        dropdownPanel.addEventListener("click", (e) => e.stopPropagation());
        card.addEventListener("click", () => {
          dropdownPanel.style.display = "none";
          dropdownArrow.setText("\u25BE");
        });
        newInput.addEventListener("input", () => {
          selection.newTopicName = newInput.value.trim();
          dropdownText.setText(newInput.value.trim() || "+ New topic");
        });
        if (selection.isNew) {
          dropdownText.setText("+ New topic");
          dropdownText.style.color = "var(--text-muted)";
          newInput.addClass("visible");
        } else {
          dropdownText.setText(selection.topic || selectedValue);
        }
        renderDropdown();
        const statsRow = body.createDiv("pa-stats");
        statsRow.createSpan({
          text: `${paper.referencedFiles.length} kept`,
          cls: "pa-badge pa-badge-keep"
        });
        statsRow.createSpan({
          text: `${paper.unreferencedFiles.length} temp removed`,
          cls: "pa-badge pa-badge-delete"
        });
        const detailToggle = body.createEl("button", {
          text: "\u25BE File list",
          cls: "pa-detail-toggle"
        });
        const detailContent = body.createDiv("pa-details-content");
        detailContent.style.display = "none";
        detailToggle.addEventListener("click", () => {
          const show = detailContent.style.display === "none";
          detailContent.style.display = show ? "" : "none";
          detailToggle.textContent = show ? "\u25BE File list" : "\u25B8 File list";
        });
        const prefix = paper.folderPath + "/";
        let html = "";
        if (paper.referencedFiles.length > 0) {
          html += `<div class="pa-file-group keeping">`;
          html += `<div class="pa-file-group-label">Kept (${paper.referencedFiles.length})</div>`;
          html += `<ul class="pa-file-list">`;
          for (const f of paper.referencedFiles) {
            html += `<li class="pa-file-keep">${escapeHtml(f.replace(prefix, ""))}</li>`;
          }
          html += `</ul></div>`;
        }
        if (paper.unreferencedFiles.length > 0) {
          html += `<div class="pa-file-group removing">`;
          html += `<div class="pa-file-group-label">Temp removed (${paper.unreferencedFiles.length})</div>`;
          html += `<ul class="pa-file-list">`;
          for (const f of paper.unreferencedFiles) {
            html += `<li class="pa-file-delete">${escapeHtml(f.replace(prefix, ""))}</li>`;
          }
          html += `</ul></div>`;
        }
        if (!html) {
          html = `<div class="pa-file-group" style="padding:8px 10px;color:var(--text-faint);font-size:11px">No files to show</div>`;
        }
        detailContent.innerHTML = html;
      }
      async executeArchive() {
        const toArchive = this.papers.filter((p) => this.includeFlags[p.name]);
        if (toArchive.length === 0) {
          new Notice2("\u6CA1\u6709\u9009\u4E2D\u4EFB\u4F55\u8BBA\u6587");
          return;
        }
        const invalidPapers = [];
        for (const paper of toArchive) {
          const sel = this.selections[paper.name];
          const topic = sel.isNew ? sel.newTopicName : sel.topic;
          if (!topic) invalidPapers.push(paper.name);
        }
        if (invalidPapers.length > 0) {
          new Notice2(`\u4EE5\u4E0B\u8BBA\u6587\u672A\u8BBE\u7F6E\u76EE\u6807\u4E3B\u9898: ${invalidPapers.join(", ")}`);
          return;
        }
        this.close();
        const results = [];
        for (const paper of toArchive) {
          const sel = this.selections[paper.name];
          const topic = sel.isNew ? sel.newTopicName : sel.topic;
          new Notice2(`\u23F3 \u6B63\u5728\u5F52\u6863: ${paper.name} \u2192 ${topic}/`);
          const result = await archivePaper(
            this.app.vault,
            paper,
            topic,
            this.settings.defaultOutputRoot
          );
          results.push({ paper, topic, result });
        }
        const successCount = results.filter((r) => r.result.success).length;
        const failCount = results.length - successCount;
        new Notice2(`\u5F52\u6863\u5B8C\u6210: ${successCount} \u6210\u529F${failCount > 0 ? `, ${failCount} \u5931\u8D25` : ""}`);
        for (const r of results) {
          console.log(
            `[\u8BBA\u6587\u5F52\u6863] ${r.paper.name} \u2192 ${r.topic} | \u6210\u529F:${r.result.success} | \u4FDD\u7559:${r.paper.referencedFiles.length} | \u4E34\u65F6\u5220\u9664:${r.paper.unreferencedFiles.length}`
          );
          if (r.result.errors.length > 0) {
            console.warn(`[\u8BBA\u6587\u5F52\u6863] ${r.paper.name} \u9519\u8BEF:`, r.result.errors);
          }
        }
      }
      onClose() {
        this.contentEl.empty();
      }
    };
    function escapeHtml(value) {
      return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    module2.exports = { BatchArchiveModal: BatchArchiveModal2 };
  }
});

// src/main.js
var { Plugin, PluginSettingTab, Setting, Notice } = require("obsidian");
var { scanInbox } = require_archiver();
var { BatchArchiveModal } = require_modal();
var DEFAULT_SETTINGS = {
  inboxRoot: "\u8BBA\u6587\u9605\u8BFB/Inbox",
  defaultOutputRoot: "\u8BBA\u6587\u9605\u8BFB"
};
module.exports = class PaperArchiverPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new PaperArchiverSettingTab(this.app, this));
    this.addCommand({
      id: "archive-papers",
      name: "\u8BBA\u6587\u5F52\u6863",
      callback: async () => {
        const papers = await scanInbox(this.app.vault, this.settings.inboxRoot);
        if (papers.length === 0) {
          new Notice("Inbox \u4E2D\u6CA1\u6709\u5F85\u5F52\u6863\u7684\u8BBA\u6587");
          return;
        }
        new BatchArchiveModal(this.app, this, papers, this.settings).open();
      }
    });
    console.log("[\u8BBA\u6587\u5F52\u6863\u5668] \u63D2\u4EF6\u5DF2\u52A0\u8F7D");
  }
  onunload() {
    console.log("[\u8BBA\u6587\u5F52\u6863\u5668] \u63D2\u4EF6\u5DF2\u5378\u8F7D");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var PaperArchiverSettingTab = class extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "\u8BBA\u6587\u5F52\u6863\u5668 \u2014 \u8BBE\u7F6E" });
    new Setting(containerEl).setName("Inbox \u6839\u76EE\u5F55").setDesc("\u8BBA\u6587\u7B14\u8BB0\u8349\u7A3F\u6240\u5728\u7684 Vault \u5185\u76F8\u5BF9\u8DEF\u5F84").addText(
      (text) => text.setPlaceholder(DEFAULT_SETTINGS.inboxRoot).setValue(this.plugin.settings.inboxRoot).onChange(async (value) => {
        this.plugin.settings.inboxRoot = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new Setting(containerEl).setName("\u9ED8\u8BA4\u8F93\u51FA\u6839\u76EE\u5F55").setDesc("\u5F52\u6863\u540E\u7684\u4E3B\u9898\u76EE\u5F55\u6240\u5728\u6839\u8DEF\u5F84").addText(
      (text) => text.setPlaceholder(DEFAULT_SETTINGS.defaultOutputRoot).setValue(this.plugin.settings.defaultOutputRoot).onChange(async (value) => {
        this.plugin.settings.defaultOutputRoot = value.trim();
        await this.plugin.saveSettings();
      })
    );
  }
};
