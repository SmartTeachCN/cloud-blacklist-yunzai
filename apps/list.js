"use strict";

import puppeteer from "puppeteer";
import fetch from "node-fetch";

let WorkInGroup = false;
const GroupNumbers = [711374703, 1032389222];

export class Screenshot extends plugin {
    constructor() {
        super({
            name: '查询云黑名单',
            des: '查询目前存在于 SmartTeachCN 智教联盟云黑的全体 QQ 用户',
            event: 'message',
            rule: [{
                reg: /^(\/|#|!|！)blacklist/i,
                fnc: 'ShowBlack'
            }],
        });
    }

    async ShowBlack(e) {
        if (!GroupNumbers.includes(e.group_id)) return;
        WorkInGroup = true;

        try {
            // 获取黑名单列表
            const response = await fetch("https://black.smart-teach.cn/list.php");
            const blacklist = await response.json();

            // 构建文本消息
            const textMsg = `智教联盟云黑列表中目前存在的用户：${blacklist.join('，')}`;
            await e.reply(textMsg);

            // 截图网页
            const browser = await puppeteer.launch({
                args: [
                    "--disable-gpu",
                    "--disable-setuid-sandbox",
                    "--no-sandbox",
                    "--no-zygote"
                ]
            });
            const page = await browser.newPage();
            await page.goto('https://black.smart-teach.cn/');
            await page.setViewport({width: 800, height: 1280});

            // 等待页面加载完成
            await page.waitForSelector('body');
            const screenshot = await page.screenshot({encoding: 'base64'});

            // 发送图片
            await e.reply(segment.image(`base64://${screenshot}`));

            await browser.close();
        } catch (error) {
            console.error('执行出错：', error);
            await e.reply('获取黑名单信息失败，请稍后再试。');
        }
    }
}