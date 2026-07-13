import { validate } from 'class-validator'
import { CreateChatRoomDto } from '../../src/chat/dto/create-chat-room.dto'

function buildDto(overrides: Partial<CreateChatRoomDto> = {}): CreateChatRoomDto {
  const dto = new CreateChatRoomDto()
  dto.courseId = 1
  dto.name = 'Sala test'
  Object.assign(dto, overrides)
  return dto
}

describe('CreateChatRoomDto', () => {
  it('nombre de exactamente 160 caracteres es valido', async () => {
    const dto = buildDto({ name: 'a'.repeat(160) })
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('nombre de 161 caracteres genera error de maxLength', async () => {
    const dto = buildDto({ name: 'a'.repeat(161) })
    const errors = await validate(dto)
    const nameErrors = errors.filter((e) => e.property === 'name')
    expect(nameErrors.length).toBeGreaterThan(0)
    expect(nameErrors[0].constraints).toHaveProperty('maxLength')
  })
})
