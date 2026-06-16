import { RoleName } from '../src/users/enums/role-name.enum'

describe('Aulafy API test setup', () => {
  it('executes Jest with TypeScript support', () => {
    expect(RoleName.ADMIN).toBe('ADMIN')
    expect(RoleName.PROFESOR).toBe('PROFESOR')
  })
})
