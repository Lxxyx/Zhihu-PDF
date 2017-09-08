import * as path from 'path'
import * as puppeteer from 'puppeteer'
import * as qs from 'querystring'
import { IPuppeteer } from './typings/puppeteer'

const Chrome = puppeteer as IPuppeteer
const PDF_DIR = path.resolve(__dirname, '../pdf/')

async function toZhiHu() {
  const browser = await Chrome.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto('https://www.zhihu.com/question/20220067/answer/16424385')
  await page.pdf({ path: `${PDF_DIR}/answer.pdf`, format: 'A4' })
  
  browser.close()
}

toZhiHu()