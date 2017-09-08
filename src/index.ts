import * as path from 'path'
import * as puppeteer from 'puppeteer'
import * as saga from 'redux-saga'
import { URL } from 'url'
import { IPuppeteer } from './typings/puppeteer'

const Chrome = puppeteer as IPuppeteer
const PDF_DIR = path.resolve(__dirname, '../pdf/')

async function generatePDF(zhihuLink: string) {

  if (!zhihuLink) {
    throw new Error('require zhihuLink')
  }

  const url = new URL(zhihuLink)
  const answerRe = /\/answer\/(\d+)\/?/

  if (!answerRe.test(url.pathname)) {
    throw new Error('require correct link, current is ' + zhihuLink)
  }
  
  const browser = await Chrome.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(zhihuLink)

  await page.exposeFunction('delay', (ms) => new Promise(resolve => setTimeout(resolve, ms)))
  await page.evaluate(async () => {
    
    const url = new window.URL(location.href)
    const answerRe = /\/answer\/(\d+)\/?/
    const answerId = answerRe.exec(url.pathname)[1]

    const scrollToBottom = () => new Promise(resolve => {
      const scrollHeight = document.body.scrollHeight
      const interval = setInterval(async () => {
        document.documentElement.scrollTop += 100
        if (scrollHeight - document.documentElement.scrollTop < window.innerHeight) {
          clearInterval(interval)
          await (window as any).delay(3000)
          resolve()
        }
      }, 1)
    })
    
    await scrollToBottom()

    const richContent = document.querySelector('.RichContent-actions')
    richContent.parentElement.removeChild(richContent)
    
    const answer = document.querySelector(`[name="${answerId}"]`).parentElement.parentElement.cloneNode(true)
    document.body.innerHTML = ''
    document.body.appendChild(answer)
  })

  const title = await page.title()
  
  await page.pdf({
    path: `${PDF_DIR}/${title}.pdf`,
    format: 'A4',
    displayHeaderFooter: false,
    printBackground: true
  })
  
  browser.close()
}

export default generatePDF
module.exports = generatePDF
