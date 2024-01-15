import pc from 'picocolors'
import fs from 'fs-extra'

export function greenIt(msg: string) {
  console.log(pc.green(msg))
}

// red it
export function redIt(msg: string) {
  console.log(pc.red(msg))
}

async function parseFile(path: string): Promise<string> {
  let result = ''
  await fs.readFile(path, 'utf-8').then((data) => {
    result = data
  },
  )
  return result
}

export function changeArgvToString(argv: any): string {
  switch (typeof argv) {
    case 'string':
    case 'number':
      return argv.toString()
    case 'object':
      return JSON.stringify(argv)
    case 'undefined':
      return ''
    default:
      if (Array.isArray(argv))
        return argv.join(' ')

      return String(argv)
  }
}
