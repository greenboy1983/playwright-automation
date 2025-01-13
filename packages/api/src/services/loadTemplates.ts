import path from "path";
import { promises as fs } from 'fs';

// 验证模板文件的格式
export function isValidTemplate(template: any) {
    return (
        template &&
        typeof template === 'object' &&
        'id' in template &&
        'name' in template &&
        'data' in template &&
        typeof template.id === 'string' &&
        typeof template.name === 'string' &&
        typeof template.data === 'object'
    );
}

interface Template {
    id: string;
    name: string;
    data: object;
}

// 加载指定目录下的所有模板
export async function loadTemplates(templatesDir: string) {
    const templates: Template[] = [];
    const files = await fs.readdir(templatesDir);

    for (const file of files) {
        if (file.endsWith('.json')) {
            try {
                const template = require(path.join(templatesDir, file));
                if (isValidTemplate(template)) {
                    templates.push(template as Template);
                } else {
                    console.warn(`Skipping invalid template file: ${file}`);
                }
            } catch (error) {
                console.error(`Error loading template file ${file}:`, error);
            }
        }
    }

    return { presets: templates };
}