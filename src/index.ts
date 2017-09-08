import * as path from 'path'
import * as puppeteer from 'puppeteer'
import * as qs from 'querystring'
import * as saga from 'redux-saga'
import { IPuppeteer } from './typings/puppeteer'

const Chrome = puppeteer as IPuppeteer
const PDF_DIR = path.resolve(__dirname, '../pdf/')

async function toZhiHu() {
  const browser = await Chrome.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto('https://www.zhihu.com/question/20220067/answer/16424385')
  await page.evaluate(async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    
    const scrollToBottom = () => new Promise(resolve => {
      const scrollHeight = document.body.scrollHeight
      const interval = setInterval(async () => {
        document.documentElement.scrollTop += 100
        if (scrollHeight - document.documentElement.scrollTop < window.innerHeight) {
          clearInterval(interval)
          await delay(3000)
          resolve()
        }
      }, 1)
    })
    
    await scrollToBottom()

    const richContent = document.querySelector('.RichContent-actions')
    richContent.parentElement.removeChild(richContent)
    
    const card = document.querySelector('[name="16424385"]').parentElement.parentElement.cloneNode(true)
    document.body.innerHTML = ''
    document.body.appendChild(card)
  })
  await page.pdf({
    path: `${PDF_DIR}/answer.pdf`,
    format: 'A4',
    displayHeaderFooter: false,
    printBackground: true
  })
  browser.close()
}

toZhiHu()