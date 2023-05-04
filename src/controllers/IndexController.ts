import { FastifyReply, FastifyRequest, RawReplyDefaultExpression, RawRequestDefaultExpression } from "fastify"

export const IndexController = async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    return reply.status(200).send({ data: "Hello!" })
  } catch (e) {
    return reply.status(500).send({ error: e })
  }
}
