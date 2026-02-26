import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class ProductsClient {
  private readonly baseUrl =
    process.env.PRODUCT_BASE_URL || 'http://localhost:3002'

  async reserveStock(input: {
    orderId: string
    items: Array<{ productId: string; qty: number }>
  }) {
    try {
      const res = await axios.post(`${this.baseUrl}/stock/reserve`, input, {
        validateStatus: () => true,
      })
      return res
    } catch (e) {
      throw new ServiceUnavailableException('Product service unavailable')
    }
  }
}
