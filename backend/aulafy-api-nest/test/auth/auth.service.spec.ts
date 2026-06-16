import * as bcrypt from 'bcryptjs'
import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../../src/auth/auth.service'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('AuthService', () => {
  const profile = {
    id: 1,
    fullName: 'Administradora Aulafy',
    email: 'admin@aulafy.cl',
    role: RoleName.ADMIN
  }

  let usersService: {
    findByEmail: jest.Mock
    findById: jest.Mock
  }
  let jwtService: {
    signAsync: jest.Mock
  }
  let service: AuthService

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn().mockResolvedValue(profile)
    }
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-demo-token')
    }
    service = new AuthService(usersService as any, jwtService as any)
  })

  it('permite login con usuario activo y firma el token JWT esperado', async () => {
    const passwordHash = await bcrypt.hash('Admin1234', 4)
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'admin@aulafy.cl',
      passwordHash,
      role: RoleName.ADMIN,
      active: true
    })

    const result = await service.login({
      email: 'admin@aulafy.cl',
      password: 'Admin1234'
    })

    expect(result).toEqual({
      token: 'jwt-demo-token',
      tokenType: 'Bearer',
      user: profile
    })
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: 'admin@aulafy.cl',
      role: RoleName.ADMIN
    })
    expect(usersService.findById).toHaveBeenCalledWith(1)
  })

  it('rechaza credenciales invalidas', async () => {
    const passwordHash = await bcrypt.hash('Admin1234', 4)
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'admin@aulafy.cl',
      passwordHash,
      role: RoleName.ADMIN,
      active: true
    })

    await expect(
      service.login({
        email: 'admin@aulafy.cl',
        password: 'ClaveIncorrecta'
      })
    ).rejects.toThrow(UnauthorizedException)
    expect(jwtService.signAsync).not.toHaveBeenCalled()
  })

  it('rechaza usuario inexistente', async () => {
    usersService.findByEmail.mockResolvedValue(null)

    await expect(
      service.login({
        email: 'noexiste@aulafy.cl',
        password: 'Admin1234'
      })
    ).rejects.toThrow(UnauthorizedException)
    expect(jwtService.signAsync).not.toHaveBeenCalled()
  })

  it('rechaza usuario inactivo', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'admin@aulafy.cl',
      passwordHash: 'hash-no-usado',
      role: RoleName.ADMIN,
      active: false
    })

    await expect(
      service.login({
        email: 'admin@aulafy.cl',
        password: 'Admin1234'
      })
    ).rejects.toThrow(UnauthorizedException)
    expect(jwtService.signAsync).not.toHaveBeenCalled()
  })
})
