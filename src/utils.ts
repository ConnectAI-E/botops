import pc from 'picocolors'

export function greenIt(msg: string) {
  console.log(pc.green(msg))
}

// red it
export function redIt(msg: string) {
  console.log(pc.red(msg))
}
