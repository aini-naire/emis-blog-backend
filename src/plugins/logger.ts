import { Writable } from 'stream'
import build from 'pino-abstract-transport'
import * as https from 'https'

const process = async ({ agent, log, options }): Promise<void> => {

    console.log(log)

    await fetch("", {
      agent,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
}

export const createTransport = (options): Writable => {
    const agent = new https.Agent({ keepAlive: true })
    console.log(options)

    return build(async (iterable: Iterable<Record<string, any>>) => {
        for await (const log of iterable) {
            try {
                await process({ agent, log, options })
            } catch (err) {
                console.error(err)
            }
        }
    })
}

export default createTransport