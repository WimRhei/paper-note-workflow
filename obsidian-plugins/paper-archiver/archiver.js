/**
 * archiver.js — 核心归档逻辑
 * 
 * 职责：
 *   1. 扫描 Inbox 找出论文文件夹（含同名 .md 的文件夹）
 *   2. 解析 .md 中的附件引用（![[file]], [[file]], ![](), []()）
 *   3. 分类文件：归档保留 vs 临时删除
 *   4. 执行归档：重写引用路径、移动归档文件、删除临时文件
 *   5. 清理空目录
 */

const { Notice } = require("obsidian");

// ========================
// 扫描 Inbox
// ========================

/**
 * 扫描 Inbox 目录，返回所有待归档论文的信息。
 * 一个论文文件夹定义为：Inbox 下的子文件夹，且包含同名的 .md 文件。
 *
 * @param {object} vault - Obsidian Vault 实例
 * @param {string} inboxPath - Inbox 在 Vault 内的相对路径
 * @returns {Promise<Array>} 论文信息数组
 */
async function scanInbox(vault, inboxPath) {
    const exists = await vault.adapter.exists(inboxPath);
    if (!exists) {
        new Notice(`Inbox 目录不存在: ${inboxPath}`);
        return [];
    }

    const listing = await vault.adapter.list(inboxPath);
    const folders = listing.folders || [];

    const papers = [];

    for (const folderPath of folders) {
        const folderName = folderPath.split("/").pop();
        // 跳过 .obsidian 等隐藏目录
        if (folderName.startsWith(".")) continue;

        const mdPath = `${folderPath}/${folderName}.md`;
        const hasMd = await vault.adapter.exists(mdPath);

        if (!hasMd) {
            // 可能是"未命名"等临时文件夹，跳过
            continue;
        }

        // 读取 markdown 内容
        const mdContent = await vault.adapter.read(mdPath);

        // 列出文件夹内所有文件，包含临时 pdffigures2/ 等任意深度目录
        const allFiles = await collectFilesRecursive(vault, folderPath);

        // 解析引用 & 分类
        const refFilenames = parseAttachmentRefs(mdContent);
        const { referenced, unreferenced } = classifyFiles(
            allFiles,
            folderPath,
            refFilenames,
            mdPath
        );

        papers.push({
            name: folderName,
            folderPath: folderPath,
            mdPath: mdPath,
            mdContent: mdContent,
            allFiles: allFiles,
            referencedFiles: referenced,
            unreferencedFiles: unreferenced,
        });
    }

    return papers;
}

// ========================
// 解析附件引用
// ========================

/**
 * 从 Markdown 文本中提取所有被引用的附件文件名。
 * 支持：
 *   - ![[filename]]   Obsidian 嵌入
 *   - [[filename]]    Obsidian 链接（非嵌入）
 *   - ![](...)        Markdown 图片
 *   - []()            Markdown 链接（非 http）
 *
 * @param {string} content - Markdown 文本
 * @returns {string[]} 被引用的文件名数组（去重）
 */
function parseAttachmentRefs(content) {
    const refs = new Set();

    // 1. Wiki 嵌入: ![[filename|alias]] 或 ![[filename]]
    const wikiEmbedRegex = /!\[\[([^\]]+)\]\]/g;
    for (const m of content.matchAll(wikiEmbedRegex)) {
        let ref = m[1];
        ref = ref.split("|")[0].trim();   // 去掉别名
        ref = ref.split("#")[0].trim();   // 去掉标题引用
        refs.add(ref.split("/").pop());
    }

    // 2. Wiki 链接（非嵌入）: [[filename]]
    const wikiLinkRegex = /(?<!!)\[\[([^\]]+)\]\]/g;
    for (const m of content.matchAll(wikiLinkRegex)) {
        let ref = m[1];
        ref = ref.split("|")[0].trim();
        ref = ref.split("#")[0].trim();
        refs.add(ref.split("/").pop());
    }

    // 3. Markdown 图片: ![...](path)
    const mdImageRegex = /!\[.*?\]\(([^)]+)\)/g;
    for (const m of content.matchAll(mdImageRegex)) {
        let ref = m[1].trim();
        if (!ref.startsWith("http")) {
            // 只取文件名部分
            refs.add(ref.split("/").pop());
        }
    }

    // 4. Markdown 链接: [...](path)，排除 http
    const mdLinkRegex = /(?<!!)\[.*?\]\(([^)]+)\)/g;
    for (const m of content.matchAll(mdLinkRegex)) {
        let ref = m[1].trim();
        if (!ref.startsWith("http")) {
            refs.add(ref.split("/").pop());
        }
    }

    return [...refs];
}

// ========================
// 文件分类
// ========================

/**
 * 将文件夹内的所有文件分为「归档保留」和「临时删除」两类。
 *   - 主 .md 文件（论文笔记本身）单独处理，不计入
 *   - xxx-naive.md 和 xxx.txt → 归档前阅读/校对文件，归档时删除
 *   - 其他 .md 文件 → 强制保留
 *   - PDF 文件 → 强制保留
 *   - 文件名与引用匹配 → 保留
 *   - 其余 → 临时文件（将被删除）
 *
 * @param {string[]} allFiles - 所有文件路径
 * @param {string} folderPath - 论文文件夹路径
 * @param {string[]} refFilenames - 被引用的文件名
 * @param {string} mdPath - 论文 .md 文件路径（排除）
 * @returns {{ referenced: string[], unreferenced: string[] }}
 */
function classifyFiles(allFiles, folderPath, refFilenames, mdPath) {
    const referenced = [];
    const unreferenced = [];
    const paperName = folderPath.split("/").pop();

    for (const filePath of allFiles) {
        // 排除论文笔记本身
        if (filePath === mdPath) continue;

        const basename = filePath.split("/").pop();
        const ext = (basename.split(".").pop() || "").toLowerCase();

        if (basename === `${paperName}-naive.md` || basename === `${paperName}.txt`) {
            unreferenced.push(filePath);
            continue;
        }

        // PDF / secondary markdown files are part of the clean handoff.
        if (["pdf", "md"].includes(ext)) {
            referenced.push(filePath);
            continue;
        }

        // 检查是否被引用
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
    files.push(...(listing.files || []));
    for (const subFolder of listing.folders || []) {
        files.push(...await collectFilesRecursive(vault, subFolder));
    }
    return files;
}

// ========================
// 归档执行
// ========================

/**
 * 归档单篇论文。
 * 步骤：
 *   1. 创建目标目录结构  <outputRoot>/<topic>/
 *   2. 写入 .md 文件到主题根目录（扁平化）
 *   3. 移动图片到主题共享 Figure/
 *   4. 移动 PDF 到主题共享 PDF/
 *   5. 删除 xxx-naive.md、xxx.txt 和临时文件
 *   7. 清理 Inbox 中的空目录
 *
 * @param {object} vault - Obsidian Vault 实例
 * @param {object} paper - 论文对象
 * @param {string} targetTopic - 目标主题名
 * @param {string} outputRoot - 输出根目录
 * @returns {Promise<{ success: boolean, targetPath: string, errors: string[] }>}
 */
async function archivePaper(vault, paper, targetTopic, outputRoot) {
    const errors = [];
    const topicDir = `${outputRoot}/${targetTopic}`;
    const figureDir = `${topicDir}/Figure`;
    const pdfDir = `${topicDir}/PDF`;

    try {
        // 1. 创建目标目录结构
        await ensureDir(vault, topicDir);
        await ensureDir(vault, figureDir);
        await ensureDir(vault, pdfDir);

        // 2. 写入主 .md 文件。正常情况下正文已经只引用 Figure/xxx-N.ext；
        // 这里仍保留路径重写作为兜底。
        const targetMd = `${topicDir}/${paper.name}.md`;
        const attachmentDestByName = buildAttachmentDestMap(paper.referencedFiles);
        const rewrittenMd = rewriteAttachmentRefs(paper.mdContent, attachmentDestByName);
        await writeTextFile(vault, targetMd, rewrittenMd);
        await vault.adapter.remove(paper.mdPath);

        // 3. 移动归档保留文件
        for (const filePath of paper.referencedFiles) {
            const basename = filePath.split("/").pop();
            const ext = (basename.split(".").pop() || "").toLowerCase();

            let destDir;
            if (ext === "pdf") {
                destDir = pdfDir;
            } else if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(ext)) {
                destDir = figureDir;
            } else {
                destDir = topicDir; // 其他类型放主题根目录
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
                errors.push(`移动失败: ${basename} — ${e.message}`);
            }
        }

        // 4. 删除未引用临时文件
        for (const filePath of paper.unreferencedFiles) {
            try {
                await vault.adapter.remove(filePath);
            } catch (e) {
                errors.push(`删除失败: ${filePath} — ${e.message}`);
            }
        }

        // 5. 清理 Inbox 中的空目录
        await cleanupEmptyDirs(vault, paper.folderPath);

        return {
            success: errors.length === 0,
            targetPath: targetMd,
            errors: errors,
        };
    } catch (e) {
        return {
            success: false,
            targetPath: topicDir,
            errors: [...errors, `归档异常: ${e.message}`],
        };
    }
}

// ========================
// 工具函数
// ========================

/**
 * 确保目录存在，不存在则创建
 */
async function ensureDir(vault, dirPath) {
    if (!(await vault.adapter.exists(dirPath))) {
        await vault.adapter.mkdir(dirPath);
    }
}

/**
 * 移动文件（复制内容 + 删除源文件）
 * 使用 readBinary/writeBinary 统一处理文本和二进制文件
 */
async function moveFile(vault, srcPath, destPath) {
    // 如果目标已存在，先删除（覆盖）
    if (await vault.adapter.exists(destPath)) {
        await vault.adapter.remove(destPath);
    }

    // 读取源文件
    const content = await vault.adapter.readBinary(srcPath);

    // 自动创建目标父目录
    const destDir = destPath.substring(0, destPath.lastIndexOf("/"));
    await ensureDir(vault, destDir);

    // 写入目标
    await vault.adapter.writeBinary(destPath, content);

    // 删除源文件
    await vault.adapter.remove(srcPath);
}

function buildAttachmentDestMap(filePaths) {
    const map = new Map();
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
        if (
            !trimmed ||
            /^(https?:|mailto:|obsidian:|#)/i.test(trimmed)
        ) {
            return rawTarget;
        }

        const basename = trimmed.split(/[\\/]/).pop();
        return attachmentDestByName.get(basename) || rawTarget;
    };

    return content
        .replace(/(!?\[\[)([^\]|#]+)((?:#[^\]|]+)?(?:\|[^\]]+)?)\]\]/g, (_m, open, target, suffix) => {
            return `${open}${rewriteTarget(target)}${suffix}]]`;
        })
        .replace(/(!?\[[^\]]*?\]\()([^)]+)(\))/g, (_m, open, target, close) => {
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

/**
 * 递归清理空目录
 */
async function cleanupEmptyDirs(vault, dirPath) {
    try {
        if (!(await vault.adapter.exists(dirPath))) return;

        const listing = await vault.adapter.list(dirPath);
        const hasFiles = (listing.files || []).length > 0;
        const hasFolders = (listing.folders || []).length > 0;

        // 先清理子目录
        if (hasFolders) {
            for (const subfolder of listing.folders) {
                await cleanupEmptyDirs(vault, subfolder);
            }
        }

        // 重新检查（子目录可能已被清理）
        const relisting = await vault.adapter.list(dirPath);
        const isEmpty =
            (relisting.files || []).length === 0 &&
            (relisting.folders || []).length === 0;

        if (isEmpty) {
            await vault.adapter.rmdir(dirPath, false);
        }
    } catch (_e) {
        // 无法清理就算了
    }
}

// ========================
// 导出
// ========================

module.exports = {
    scanInbox,
    parseAttachmentRefs,
    classifyFiles,
    archivePaper,
    cleanupEmptyDirs,
};
