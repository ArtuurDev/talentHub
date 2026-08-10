import { Entity } from '../../../core/entities/entity'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Optional } from '../../../core/utility/optional'

export enum ProgrammingSkill {
  JAVASCRIPT = 'JAVASCRIPT',
  TYPESCRIPT = 'TYPESCRIPT',
  PYTHON = 'PYTHON',
  JAVA = 'JAVA',
  CSHARP = 'CSHARP',
  PHP = 'PHP',
  GO = 'GO',
  RUST = 'RUST',
  KOTLIN = 'KOTLIN',
  SQL = 'SQL',
  HTML = 'HTML',
  CSS = 'CSS',
  REACT = 'REACT',
  ANGULAR = 'ANGULAR',
  VUE = 'VUE',
  NODEJS = 'NODEJS',
  NESTJS = 'NESTJS',
  SPRING = 'SPRING',
  SOLID = 'SOLID',
  DESIGN_PATTERNS = 'DESIGN_PATTERNS',
  CLEAN_ARCHITECTURE = 'CLEAN_ARCHITECTURE',
  REST_API = 'REST_API',
  GRAPHQL = 'GRAPHQL',
  GIT = 'GIT',
  DOCKER = 'DOCKER',
  KUBERNETES = 'KUBERNETES',
  AWS = 'AWS',
  CI_CD = 'CI_CD',
  UNIT_TESTING = 'UNIT_TESTING',
  INTEGRATION_TESTING = 'INTEGRATION_TESTING',
  E2E_TESTING = 'E2E_TESTING',
  TDD = 'TDD',
}

export interface UserSkillProps {
  userId: string
  skill: ProgrammingSkill
  createdAt: Date
  updatedAt?: Date | null
}

export class UserSkill extends Entity<UserSkillProps> {
  private constructor(props: UserSkillProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get userId() {
    return this.props.userId
  }

  get skill() {
    return this.props.skill
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: Optional<UserSkillProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityId) {
    return new UserSkill(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )
  }

  updateSkill(skill: ProgrammingSkill) {
    this.props.skill = skill
    this.props.updatedAt = new Date()
  }
}
