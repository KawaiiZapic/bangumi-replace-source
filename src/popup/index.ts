import { tabs } from "webextension-polyfill";
import { IConfig, loadConfig } from "../config";

interface FormItemDeclaration<T extends IConfig = IConfig> {
    key: keyof T;
    name?: string;
    type: "number" | "range" | "text" | "checkbox" | "select";
    min?: number;
    max?: number;
    maxLength?: number;
    commit?: "blur" | "change" | "input";
    options?: {
        label?: string;
        value: T[keyof T];
    }[];
    extraClass?: string;
}

const generateFormItem = <T extends IConfig>(config: T, item: FormItemDeclaration<T>) => {
    const wrapper = document.createElement("div");
    wrapper.className = "config-item" + (item.extraClass ? " " + item.extraClass : "") + (item.type == "checkbox" ? " row" : "");

    const name = item.name ?? item.key as string;
    const label = document.createElement("label");
    label.setAttribute("for", item.key as string);
    label.innerText = name;
    wrapper.append(label);

    let input: HTMLInputElement | HTMLSelectElement;

    if (["number", "range", "text", "checkbox"].includes(item.type)) {
        input = document.createElement("input");
        input.type = item.type;
        input.name = item.key as string;
        if (typeof item.max != "undefined") {
            input.max = item.max.toString();
        }
        if (typeof item.min != "undefined") {
            input.max = item.min.toString();
        }
        if (typeof item.maxLength != "undefined") {
            input.max = item.maxLength.toString();
        }
    } else if (item.type == "select") {
        input = document.createElement("select");
        item.options?.forEach(v => {
            const option = document.createElement("option");
            option.innerText = v.label ?? v.value as string;
            option.value = v.value as string;
            input.append(option);
        })
    } else {
        throw Error("Unrecognized item type: " + item.type);
    }

    const eventName = item.commit ?? "change";
    input.addEventListener(eventName, () => {
        let value: any;
        if (["range", "number"].includes(item.type)) {
            value = parseFloat(input.value);
        } else if (item.type == "checkbox") {
            value = (input as HTMLInputElement).checked;
        } else {
            value = input.value;
        }
        config[item.key] = value;
    });
    input.setAttribute("name", item.key as string);

    if (item.type != "checkbox") {
        input.value = config[item.key] as string;
        wrapper.append(input);
    } else {
        (input as HTMLInputElement).checked = config[item.key] as boolean;
        wrapper.prepend(input);
    }
    return wrapper;
}

const configList: FormItemDeclaration[] = [{
    key: "isEnabled",
    name: "启用",
    type: "checkbox"
},
{
    key: "forceAlign",
    name: "强制对齐视频长度",
    type: "checkbox"
}, {
    key: "autoPromptSelect",
    name: "换集时自动打开文件选择窗口",
    type: "checkbox"
},{
    key: "offset",
    name: "偏移",
    type: "number"
}];
async function main() {
    const config = await loadConfig();
    configList.forEach(v => {
        document.body.append(generateFormItem(config, v));
    });

    document.querySelector("#selectVideo")!.addEventListener("click", async () => {
        const current = (await tabs.query({ currentWindow: true, active: true }))[0]?.id;
        if (!current) return;
        tabs.sendMessage(current, "selectVideo");
    });
    document.querySelector("#removeVideo")!.addEventListener("click", async () => {
        const current = (await tabs.query({ currentWindow: true, active: true }))[0]?.id;
        if (!current) return;
        tabs.sendMessage(current, "removeVideo");
    });
}

document.addEventListener("DOMContentLoaded", () => main());