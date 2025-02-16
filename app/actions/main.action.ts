'use server'
import _ from 'lodash'

export async function getFetch(url: string) {
  let data = await fetch(url)
  let text = await data.text()
  return text
}
