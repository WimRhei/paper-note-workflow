/**
 * modal.js — 归档批处理面板
 *
 * 只负责 UI：
 *   1. 展示 Inbox 中所有待归档论文
 *   2. 每篇论文可独立选择目标主题（或新建主题）
 *   3. 预览归档保留/临时删除文件列表
 *   4. 一键调用 archiver 执行归档
 */

const { Modal, Notice } = require("obsidian");
const { archivePaper } = require("./archiver.js");

class BatchArchiveModal extends Modal {
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
        headerLeft.createSpan({ text: "📦", cls: "pa-header-icon" });
        headerLeft.createEl("h2", { text: "论文归档" });
        header.createSpan({
            text: `${this.papers.length} papers`,
            cls: "pa-badge-count",
        });

        await this.scanTopics();

        const paperList = contentEl.createDiv("paper-archiver-list");
        for (const paper of this.papers) {
            this.includeFlags[paper.name] = true;
            this.selections[paper.name] = {
                topic: this.existingTopics.length > 0 ? this.existingTopics[0] : "",
                isNew: this.existingTopics.length === 0,
                newTopicName: "",
            };
            this.createPaperRow(paperList, paper);
        }

        const footer = contentEl.createDiv("pa-footer");
        footer.createSpan({
            text: "Select papers and target topics, then archive.",
            cls: "pa-footer-hint",
        });

        const cancelBtn = footer.createEl("button", {
            text: "Cancel",
            cls: "pa-btn pa-btn-secondary",
        });
        cancelBtn.addEventListener("click", () => this.close());

        const execBtn = footer.createEl("button", {
            text: "Archive papers",
            cls: "pa-btn pa-btn-primary",
        });
        execBtn.addEventListener("click", () => this.executeArchive());
    }

    async scanTopics() {
        const outputRoot = this.settings.defaultOutputRoot;
        if (!(await this.app.vault.adapter.exists(outputRoot))) {
            this.existingTopics = [];
            return;
        }

        const listing = await this.app.vault.adapter.list(outputRoot);
        const exclude = new Set(["Inbox", ".obsidian", "待读论文.md"]);
        this.existingTopics = (listing.folders || [])
            .map((f) => f.split("/").pop())
            .filter((name) => !exclude.has(name) && !name.startsWith("."))
            .sort();
    }

    createPaperRow(container, paper) {
        const card = container.createDiv("pa-card");

        const cardHeader = card.createDiv("pa-card-header");
        const title = cardHeader.createDiv("pa-card-title");
        title.createSpan({ text: "📄", cls: "pa-card-icon" });
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
        dropdownArrow.setText("▾");

        const dropdownPanel = dropdownWrap.createDiv("pa-dropdown-panel");
        dropdownPanel.style.display = "none";

        const selection = this.selections[paper.name];
        let selectedValue = this.existingTopics.length > 0 ? this.existingTopics[0] : "__new__";

        const newInput = topicRow.createEl("input", {
            type: "text",
            placeholder: "new-topic-name",
            cls: "pa-input",
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
                    dropdownArrow.setText("▾");
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
                dropdownArrow.setText("▾");
                renderDropdown();
            });
        };

        dropdownBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const show = dropdownPanel.style.display === "none";
            dropdownPanel.style.display = show ? "block" : "none";
            dropdownArrow.setText(show ? "▴" : "▾");
        });

        dropdownPanel.addEventListener("click", (e) => e.stopPropagation());
        card.addEventListener("click", () => {
            dropdownPanel.style.display = "none";
            dropdownArrow.setText("▾");
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
            cls: "pa-badge pa-badge-keep",
        });
        statsRow.createSpan({
            text: `${paper.unreferencedFiles.length} temp removed`,
            cls: "pa-badge pa-badge-delete",
        });

        const detailToggle = body.createEl("button", {
            text: "▾ File list",
            cls: "pa-detail-toggle",
        });
        const detailContent = body.createDiv("pa-details-content");
        detailContent.style.display = "none";

        detailToggle.addEventListener("click", () => {
            const show = detailContent.style.display === "none";
            detailContent.style.display = show ? "" : "none";
            detailToggle.textContent = show ? "▾ File list" : "▸ File list";
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
            new Notice("没有选中任何论文");
            return;
        }

        const invalidPapers = [];
        for (const paper of toArchive) {
            const sel = this.selections[paper.name];
            const topic = sel.isNew ? sel.newTopicName : sel.topic;
            if (!topic) invalidPapers.push(paper.name);
        }

        if (invalidPapers.length > 0) {
            new Notice(`以下论文未设置目标主题: ${invalidPapers.join(", ")}`);
            return;
        }

        this.close();

        const results = [];
        for (const paper of toArchive) {
            const sel = this.selections[paper.name];
            const topic = sel.isNew ? sel.newTopicName : sel.topic;

            new Notice(`⏳ 正在归档: ${paper.name} → ${topic}/`);
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
        new Notice(`归档完成: ${successCount} 成功${failCount > 0 ? `, ${failCount} 失败` : ""}`);

        for (const r of results) {
            console.log(
                `[论文归档] ${r.paper.name} → ${r.topic} | ` +
                `成功:${r.result.success} | ` +
                `保留:${r.paper.referencedFiles.length} | ` +
                `临时删除:${r.paper.unreferencedFiles.length}`
            );
            if (r.result.errors.length > 0) {
                console.warn(`[论文归档] ${r.paper.name} 错误:`, r.result.errors);
            }
        }
    }

    onClose() {
        this.contentEl.empty();
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

module.exports = { BatchArchiveModal };
