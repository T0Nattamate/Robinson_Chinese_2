import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow frontend to connect
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  sendUserInfoUpdate(lineId: string, data: any) {
    this.server.emit(`user-info-${lineId}`, data);
  }

  // Emit receipt status updates (for real-time table updates)
  sendReceiptUpdate(lineId: string, receiptData: any) {
    this.server.emit(`receipt-update-${lineId}`, receiptData);
  }
}
