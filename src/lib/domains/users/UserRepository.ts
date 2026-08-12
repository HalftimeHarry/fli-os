import type { User } from './User';

export interface UserRepository {
	findById(id: string): Promise<User | null>;
	findAll(): Promise<User[]>;
	create(user: User, password?: string): Promise<User>;
	update(id: string, user: User): Promise<User>;
	delete(id: string): Promise<void>;
}
