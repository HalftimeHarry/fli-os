import { AuthContext } from '$lib/core/auth/AuthContext';
import { AuthorizationService } from '$lib/core/auth/AuthorizationService';
import type { AppConfig } from '$lib/core/types/AppConfig';
import { DepartmentService } from '$lib/domains/departments/DepartmentService';
import type { DepartmentRepository } from '$lib/domains/departments/DepartmentRepository';
import { OrganizationService } from '$lib/domains/organization/OrganizationService';
import type { OrganizationRepository } from '$lib/domains/organization/OrganizationRepository';
import { RoleService } from '$lib/domains/roles/RoleService';
import type { RoleRepository } from '$lib/domains/roles/RoleRepository';
import { UserService } from '$lib/domains/users/UserService';
import type { UserRepository } from '$lib/domains/users/UserRepository';
import { ProjectController } from '$lib/domains/projects/ProjectController';
import type { ProjectRepository } from '$lib/domains/projects/ProjectRepository';
import { ProjectService } from '$lib/domains/projects/ProjectService';
import { ProjectTaskController } from '$lib/domains/tasks/ProjectTaskController';
import type { ProjectTaskRepository } from '$lib/domains/tasks/ProjectTaskRepository';
import { ProjectTaskService } from '$lib/domains/tasks/ProjectTaskService';
import { PocketBaseProvider } from '$lib/infrastructure/pocketbase/PocketBaseProvider';
import { PocketBaseDepartmentRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseDepartmentRepository';
import { PocketBaseOrganizationRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseOrganizationRepository';
import { PocketBaseProjectRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseProjectRepository';
import { PocketBaseProjectTaskRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseProjectTaskRepository';
import { PocketBaseRoleRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseRoleRepository';
import { PocketBaseUserRepository } from '$lib/infrastructure/pocketbase/repositories/PocketBaseUserRepository';

/**
 * Composition root for application dependencies.
 *
 * Infrastructure providers, repositories, services,
 * and controllers will be assembled here.
 */
export class AppContainer {
	readonly pocketBase: PocketBaseProvider;

	readonly organizations: OrganizationRepository;
	readonly users: UserRepository;
	readonly roles: RoleRepository;
	readonly departments: DepartmentRepository;
	readonly projects: ProjectRepository;
	readonly projectTasks: ProjectTaskRepository;

	readonly organizationService: OrganizationService;
	readonly userService: UserService;
	readonly roleService: RoleService;
	readonly departmentService: DepartmentService;
	readonly projectService: ProjectService;
	readonly projectTaskService: ProjectTaskService;
	readonly projectController: ProjectController;
	readonly projectTaskController: ProjectTaskController;
	readonly authContext: AuthContext;
	readonly authorizationService: AuthorizationService;

	constructor(config: AppConfig) {
		this.pocketBase = new PocketBaseProvider(config.pocketBaseUrl);

		this.organizations = new PocketBaseOrganizationRepository(this.pocketBase);
		this.users = new PocketBaseUserRepository(this.pocketBase);
		this.roles = new PocketBaseRoleRepository(this.pocketBase);
		this.departments = new PocketBaseDepartmentRepository(this.pocketBase);
		this.projects = new PocketBaseProjectRepository(this.pocketBase);
		this.projectTasks = new PocketBaseProjectTaskRepository(this.pocketBase);

		this.organizationService = new OrganizationService(this.organizations);
		this.roleService = new RoleService(this.roles, this.organizations);
		this.departmentService = new DepartmentService(this.departments, this.organizations);
		this.userService = new UserService(
			this.users,
			this.organizations,
			this.roles,
			this.departments
		);
		this.projectService = new ProjectService(this.projects, this.organizations, this.departments);
		this.projectTaskService = new ProjectTaskService(this.projectTasks, this.projects, this.users);
		this.projectController = new ProjectController(this.projectService);
		this.projectTaskController = new ProjectTaskController(this.projectTaskService);

		this.authContext = new AuthContext(this.pocketBase, this.users);
		this.authorizationService = new AuthorizationService(this.authContext, this.roles);
	}
}
