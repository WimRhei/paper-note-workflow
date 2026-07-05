/**
 * src/main.js — 插件源码入口
 *
 * 只负责：
 *   1. 加载 / 保存插件设置
 *   2. 注册「论文归档」命令
 *   3. 调用 archiver 扫描 Inbox
 *   4. 打开 modal 收集用户选择
 *
 * Obsidian 实际加载根目录下 build 生成的 main.js。
 */

const { Plugin, PluginSettingTab, Setting, Notice } = require("obsidian");
const { scanInbox } = require("../archiver.js");
const { BatchArchiveModal } = require("../modal.js");

const DEFAULT_SETTINGS = {
    inboxRoot: "论文阅读/Inbox",
    defaultOutputRoot: "论文阅读",
};

module.exports = class PaperArchiverPlugin extends Plugin {
    async onload() {
        await this.loadSettings();
        this.addSettingTab(new PaperArchiverSettingTab(this.app, this));

        this.addCommand({
            id: "archive-papers",
            name: "论文归档",
            callback: async () => {
                const papers = await scanInbox(this.app.vault, this.settings.inboxRoot);
                if (papers.length === 0) {
                    new Notice("Inbox 中没有待归档的论文");
                    return;
                }

                new BatchArchiveModal(this.app, this, papers, this.settings).open();
            },
        });

        console.log("[论文归档器] 插件已加载");
    }

    onunload() {
        console.log("[论文归档器] 插件已卸载");
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
};

class PaperArchiverSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "论文归档器 — 设置" });

        new Setting(containerEl)
            .setName("Inbox 根目录")
            .setDesc("论文笔记草稿所在的 Vault 内相对路径")
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.inboxRoot)
                    .setValue(this.plugin.settings.inboxRoot)
                    .onChange(async (value) => {
                        this.plugin.settings.inboxRoot = value.trim();
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("默认输出根目录")
            .setDesc("归档后的主题目录所在根路径")
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.defaultOutputRoot)
                    .setValue(this.plugin.settings.defaultOutputRoot)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultOutputRoot = value.trim();
                        await this.plugin.saveSettings();
                    })
            );
    }
}
