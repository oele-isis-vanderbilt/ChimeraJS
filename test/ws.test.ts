import WebSocket from 'isomorphic-ws'
import WSServer from '../src/WSServer'
import WSClient from '../src/WSClient'
import { Message } from '../src/Message'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')
cjsLogger.setLevel(jsLogger.DEBUG)

describe('WebSocket Server with Class Implementation', () => {

  test("Server Echoing", async () => {
    const port = 5555
    const server = new WSServer(port)

    // Specifying methods
    server.onmessage = (message: Message, webSocket: WebSocket) => {
      webSocket.send(JSON.stringify(message))
    }

    // Staring the server
    await server.start()
    
    // Create test client
    const client = new WSClient('ws://localhost:' + port.toString(), 1)
    await client.waitConnect()

    // Send client message
    const testMessage: Message = {event: 'ECHO', data: "This is a test message"}
    client.send(testMessage);

    // Perform assertions on the response
    await client.waitClose()

    const [responseMessage] = client.messages;
    expect(responseMessage).toStrictEqual(testMessage);
  
    server.close()

  })
  
  test("Client Starting Before", async () => {
    const port = 6666
    
    // Create test client
    const client = new WSClient('ws://localhost:' + port.toString(), 1)

    setTimeout(async () => {
      const server = new WSServer(port)

      // Specifying methods
      server.onmessage = (message: Message, webSocket: WebSocket) => {
        webSocket.send(JSON.stringify(message))
      }

      // Staring the server
      await server.start()
      await client.waitConnect()

      // Send client message
      const testMessage: Message = {event: 'ECHO', data: "This is a test message"}
      client.send(testMessage);

      // Perform assertions on the response
      await client.waitClose()

      const [responseMessage] = client.messages;
      expect(responseMessage).toStrictEqual(testMessage);
    
      server.close()
    }, 14000)
      
    await client.waitConnect()
    await client.waitClose()
  }, 20000)
  
  test("Client not connect yet not crashing system", async () => {
    const port = 6667
    
    // Create test client
    const client = new WSClient('ws://localhost:' + port.toString(), 1)

    // Send client message
    const testMessage: Message = {event: 'ECHO', data: "This is a test message"}
    client.send(testMessage);

    // Perform assertions on the response
    client.close()

    expect(client.messages.length).toStrictEqual(0);
  })
})
