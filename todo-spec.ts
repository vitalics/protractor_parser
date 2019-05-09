import { browser, element, by, By, $, $$, ExpectedConditions, ElementFinder } from 'protractor';

import { writeFile, writeFileSync } from 'fs';

class TopHelper {
    public static getTableRow(index: number): ElementFinder {
        return $(`body > div:nth-child(11) > div:nth-child(2) > div:nth-child(${5 + index})`);
    }
    public static openMainPage() {
        console.log('OPEN main page');
        browser.get('https://socialblade.com/youtube/top/5000');
        return browser.sleep(10000);
    }
}

interface ParsedResult {
    name: string;
    country: string;
    id: string | number;
    links: string[];
    language: 'RU' | 'EN';
    email?: string;
    capcha?: boolean;
}

class Helper {
    public static randomDelayTime(): number {
        return 5000 + Math.floor(Math.random() * 7000);
    }
    public static randomWait() {
        return browser.sleep(Helper.randomDelayTime());
    }
    public static defaultWait() {
        return browser.sleep(1000);
    }
    public static scrollIntoview(el) {
        return browser.executeScript(
            "arguments[0].scrollIntoView(true);",
            el.getWebElement()
        );
    }

    public static writeFile(data: ParsedResult[]) {
        writeFileSync('parsed.json', JSON.stringify(data));
    }
}

const data: ParsedResult[] = [];
let links: string[] = [];
let capcha;

describe('top 5000', () => {
    browser.waitForAngularEnabled(false);
    let originDefaultTimeoutInterval = 0;
    beforeAll(() => {
        originDefaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    })
    afterAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originDefaultTimeoutInterval;
        Helper.writeFile(data);
    })
    it('open top 5000', async () => {
        browser.ignoreSynchronization = true;
        await TopHelper.openMainPage();
    });

    // generate tests
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        links = [];
        it(`open blogger page index: ${rowIndex}`, async () => {
            try {
                await Helper.randomWait();

                const row = TopHelper.getTableRow(rowIndex)
                await Helper.randomWait();

                const channelRow = row.all(by.css('a'))
                    .get(0);
                await Helper.scrollIntoview(channelRow);

                const channelName = await channelRow.getText();
                await channelRow
                    .click();

                await Helper.defaultWait();

                const countryName = await $$('.YouTubeUserTopInfo')
                    .get(3)
                    .all(by.css('a'))
                    .get(0)
                    .getText();

                const language = countryName === 'RU' ? 'RU' : 'EN';
                console.log(`origin country: ${countryName}, language: ${language}`)

                const socialLinksEl = $$('#YouTubeUserTopSocial a');
                console.log(`channel: ${channelName} index: ${rowIndex}`)
                let youtubeEmail = '';
                await socialLinksEl.each(async (socialLinkEl) => {
                    links = [];
                    let link = await socialLinkEl.getAttribute("href");
                    capcha = true;

                    if (link.includes('youtube.com')) {
                        link += '/about'
                        Helper.randomWait();

                        await browser.get(link);

                        try {
                            await Helper.randomWait();
                            const emailEl = $$('table .ytd-channel-about-metadata-renderer td').get(1);
                            Helper.scrollIntoview(emailEl);
                            youtubeEmail = (await emailEl.getAttribute('innerText')).trim().split('\n').join().toUpperCase();
                            console.log(`youtube hidden email is: ${youtubeEmail}`);
                            if (youtubeEmail.includes('ПОКАЗАТЬ АДРЕС ЭЛЕКТРОННОЙ ПОЧТЫ') || youtubeEmail.includes('VIEW EMAIL ADDRESS')) {
                                capcha = true;
                                youtubeEmail = null;
                            } else {
                                capcha = false;
                            }
                        }
                        catch {
                            console.log(`no email provided for this channel`);
                            capcha = false;
                            youtubeEmail = null;
                        } finally {
                            await browser.navigate().back();
                        }
                    }

                    links.push(link);
                    console.log(`link: ${link}`);
                })
                data.push({ id: rowIndex, name: channelName, country: countryName, language, links, email: youtubeEmail, capcha });

                await browser.navigate().back();

            } catch (err) {
                console.warn(`cannot pass row: ${rowIndex}`);
                console.log('-----------------');
                console.log(err);
                console.log('-----------------');
                await TopHelper.openMainPage();
            }
        })
    }
});
