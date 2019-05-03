'use strict';

import { browser, element, by, By, $, $$, ExpectedConditions, ElementFinder } from 'protractor';

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
}

describe('top 5000', () => {
    let originDefaultTimeoutInterval = 0;
    beforeAll(() => {
        originDefaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    })
    afterAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originDefaultTimeoutInterval;
    })
    it('open top 5000', async () => {
        browser.ignoreSynchronization = true;
        await TopHelper.openMainPage();
    });

    // generate tests
    for (let rowIndex = 0; rowIndex < 5000; rowIndex++) {
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

                console.log(`origin country: ${countryName}, language: ${countryName === 'RU' ? 'RU' : 'EN'}`)

                const socialLinksEl = $$('#YouTubeUserTopSocial a');
                console.log(`channel: ${channelName} index: ${rowIndex}`)
                await socialLinksEl.each(async (socialLinkEl) => {
                    const link = await socialLinkEl.getAttribute("href")
                    if (link.includes('facebook')) {
                        await socialLinkEl.click();
                        await Helper.randomWait();

                        // открыть в фейсбуке список контактов
                        await element.all(by.css('a._5u7u'))
                            .get(0)
                            .click();

                        await Helper.randomWait();

                        let mail = '';

                        try {
                            // получить емейл
                            mail = await $('#u_0_m').getText();
                        } catch (err) { }

                        console.log(`mail: ${mail}`);

                        await browser.close();
                        await Helper.randomWait();
                    }
                    console.log(`link: ${link}`);
                })

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


    // it('should list todos', function () {
    //     expect(todoList.count()).toEqual(2);
    //     expect(todoList.get(1).getText()).toEqual('build an angular app');
    // });

    // it('should add a todo', function () {
    //     var addTodo = element(by.model('todoList.todoText'));
    //     var addButton = element(by.css('[value="add"]'));

    //     addTodo.sendKeys('write a protractor test');
    //     addButton.click();

    //     expect(todoList.count()).toEqual(3);
    //     expect(todoList.get(2).getText()).toEqual('write a protractor test');
    // });
});
