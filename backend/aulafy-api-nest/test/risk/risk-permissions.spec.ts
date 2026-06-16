import 'reflect-metadata'
import { ForbiddenException } from '@nestjs/common'
import { ExecutionContext } from '@nestjs/common'
import { RiskController } from '../../src/risk/risk.controller'
import { ROLES_KEY } from '../../src/common/auth/roles.decorator'
import { RolesGuard } from '../../src/common/auth/roles.guard'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('RiskController permissions', () => {
  it('declara acceso a riesgo academico solo para ADMIN y COLEGIO', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, RiskController.prototype.academicRisk)

    expect(roles).toEqual([RoleName.ADMIN, RoleName.COLEGIO])
  })

  it.each([RoleName.ADMIN, RoleName.COLEGIO])('permite %s en RolesGuard', (role) => {
    const guard = buildGuard([RoleName.ADMIN, RoleName.COLEGIO])

    expect(guard.canActivate(contextFor(role))).toBe(true)
  })

  it.each([RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE])(
    'deniega %s en RolesGuard',
    (role) => {
      const guard = buildGuard([RoleName.ADMIN, RoleName.COLEGIO])

      expect(() => guard.canActivate(contextFor(role))).toThrow(ForbiddenException)
    }
  )
})

function buildGuard(requiredRoles: RoleName[]) {
  return new RolesGuard({
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles)
  } as any)
}

function contextFor(role: RoleName): ExecutionContext {
  return {
    getHandler: () => RiskController.prototype.academicRisk,
    getClass: () => RiskController,
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          sub: 1,
          email: 'demo@aulafy.cl',
          role
        }
      })
    })
  } as any
}
