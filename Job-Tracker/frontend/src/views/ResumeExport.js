const loadedScripts = new Map();

function loadScript(url) {
    if (loadedScripts.has(url)) return loadedScripts.get(url);

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = () => {
            loadedScripts.delete(url);
            script.remove();
            reject(new Error("The export tools could not load. Check your connection and try again."));
        };
        document.head.append(script);
    });

    loadedScripts.set(url, promise);
    return promise;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function safeFilename(value) {
    return (value || "Resume")
        .replace(/[^\p{L}\p{N} _-]/gu, "")
        .trim()
        .slice(0, 90) || "Resume";
}

function contactLine(resume) {
    return [
        resume.email,
        resume.phone,
        resume.location,
        resume.linkedin,
        resume.github,
        resume.website,
    ].filter(Boolean).join("  •  ");
}

function sectionBody(section) {
    if (section.type === "experience") {
        return (section.items || []).map((item) => [
            [item.role, item.company].filter(Boolean).join(" | "),
            item.dates,
            ...(item.bullets || []).filter(Boolean).map((bullet) => `• ${bullet}`),
        ].filter(Boolean).join("\n")).join("\n\n");
    }

    return (section.points || []).filter(Boolean).join("\n");
}

export function resumeTemplateData(resume) {
    return {
        name: resume.name || "",
        contact: contactLine(resume),
        sections: (resume.sections || []).map((section) => ({
            title: section.title,
            body: sectionBody(section),
        })),
    };
}

function pdfDefinition(resume) {
    const content = [
        { text: resume.name || "Your name", fontSize: 23, bold: true, margin: [0, 0, 0, 5] },
        { text: contactLine(resume), color: "#555555", fontSize: 9, margin: [0, 0, 0, 15] },
    ];

    for (const section of resume.sections || []) {
        const hasContent = section.type === "experience"
            ? (section.items || []).some((item) => (item.bullets || []).some(Boolean))
            : (section.points || []).some(Boolean);

        if (!hasContent) continue;

        content.push({
            text: section.title.toUpperCase(),
            fontSize: 10,
            bold: true,
            color: "#242129",
            margin: [0, 13, 0, 7],
            headlineLevel: 1,
        });

        if (section.type === "experience") {
            for (const item of section.items || []) {
                const bullets = (item.bullets || []).filter(Boolean);
                if (!bullets.length) continue;
                content.push({
                    stack: [
                        {
                            text: [
                                { text: item.role || "Role", bold: true },
                                ...(item.company ? [{ text: ` | ${item.company}` }] : []),
                            ], margin: [0, 5, 0, 2]
                        },
                        { text: item.dates || "", fontSize: 9, color: "#666666", margin: [0, 0, 0, 4] },
                    ],
                    unbreakable: true,
                    headlineLevel: 2,
                });
                content.push({ ul: bullets, margin: [0, 0, 0, 5] });
            }
        } else if (section.type === "skills") {
            content.push({ text: section.points.filter(Boolean).join("  •  ") });
        } else {
            content.push({ ul: section.points.filter(Boolean) });
        }
    }

    return {
        pageSize: "A4",
        pageMargins: [45, 42, 45, 42],
        info: { title: `${resume.name || "Candidate"} Resume`, author: resume.name || "" },
        defaultStyle: { font: "Roboto", fontSize: 10.5, lineHeight: 1.2, color: "#242129" },
        content,
        pageBreakBefore: (node, following) => Boolean(node.headlineLevel && following.length === 0),
    };
}

export async function downloadResumePdf(resume, name) {
    await loadScript("https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/pdfmake.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/vfs_fonts.js");
    const blob = await new Promise((resolve, reject) => {
        try {
            window.pdfMake.createPdf(pdfDefinition(resume)).getBlob(resolve);
        } catch (error) {
            reject(error);
        }
    });
    downloadBlob(blob, `${safeFilename(name || resume.name)}.pdf`);
}

async function loadWordTools() {
    await loadScript("https://cdn.jsdelivr.net/npm/pizzip@3.1.7/dist/pizzip.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/docxtemplater@3.62.0/build/docxtemplater.js");
}

function makeWordTemplate(bytes) {
    return new window.docxtemplater(new window.PizZip(bytes), {
        paragraphLoop: true,
        linebreaks: true,
        errorLogging: false,
        nullGetter: () => "",
    });
}

export async function readWordTemplate(file) {
    if (!file.name.toLowerCase().endsWith(".docx")) throw new Error("Choose a Word .docx template.");
    if (file.size > 2 * 1024 * 1024) throw new Error("Choose a template smaller than 2 MB.");
    await loadWordTools();
    const bytes = await file.arrayBuffer();
    let document;
    try {
        document = makeWordTemplate(bytes);
    } catch {
        throw new Error("This template is invalid. Use the supplied sample template as a starting point.");
    }
    const text = document.getFullText();
    if (!["{name}", "{contact}", "{#sections}", "{title}", "{body}", "{/sections}"].every((tag) => text.includes(tag))) {
        throw new Error("The template must contain {name}, {contact}, and the {#sections} block with {title} and {body}.");
    }
    const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(new Blob([bytes]));
    });
    return { name: file.name, base64 };
}

export async function downloadResumeWord(template, resume, name) {
    await loadWordTools();
    const bytes = Uint8Array.from(atob(template.base64), (character) => character.charCodeAt(0));
    const document = makeWordTemplate(bytes);
    document.render(resumeTemplateData(resume));
    const blob = document.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        compression: "DEFLATE",
    });
    downloadBlob(blob, `${safeFilename(name || resume.name)}.docx`);
}
