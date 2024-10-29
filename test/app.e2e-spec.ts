import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateOrganizationDto } from 'src/organization/dtos/create-organization.dto';
import { InviteUserDto } from 'src/organization/dtos/invite-user.dto';


describe('Organization E2E Tests', () => {
    let app: INestApplication;
    let token: string; // JWT token for authenticated requests
    let refreshToken: string; // JWT refresh token
    let organizationId: string; // Stores organization ID for test cases

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], // Import main module for all dependencies
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Signup: should create a new user account', async () => {
        const signupDto = { name: 'John Doe', email: 'johndoe2@example.com', password: 'password123' };
        
        const response = await request(app.getHttpServer())
            .post('/signup')
            .send(signupDto);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User added successfully');
    });

    it('Signin: should authenticate user and return access and refresh tokens', async () => {
        const signinDto = { email: 'johndoe2@example.com', password: 'password123' };
        
        const response = await request(app.getHttpServer())
            .post('/signin')
            .send(signinDto);

        expect(response.status).toBe(201);
        expect(response.body.access_token).toBeDefined();
        expect(response.body.refresh_token).toBeDefined();

        token = response.body.access_token;
        refreshToken = response.body.refresh_token;
    });

    it('Refresh Token: should refresh access and refresh tokens', async () => {
        const refreshTokenDto = { refresh_token: refreshToken };

        const response = await request(app.getHttpServer())
            .post('/refresh-token')
            .send(refreshTokenDto);

        expect(response.status).toBe(201);
        expect(response.body.access_token).toBeDefined();
        expect(response.body.refresh_token).toBeDefined();

        token = response.body.access_token;
        refreshToken = response.body.refresh_token;        
    });

    it('Create Organization: should create a new organization', async () => {
        const createOrgDto: CreateOrganizationDto = {
            name: 'Test Organization',
            description: 'This is a test organization',
        };

        const response = await request(app.getHttpServer())
            .post('/organization')
            .set('Authorization', `Bearer ${token}`)
            .send(createOrgDto);

        expect(response.status).toBe(201);
        expect(response.body.organization_id).toBeDefined();
        organizationId = response.body.organization_id;
    });

    it('Read Organization: should retrieve an organization by ID', async () => {
        const response = await request(app.getHttpServer())
            .get(`/organization/${organizationId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.organization_id).toBe(organizationId);
        expect(response.body.name).toBe('Test Organization');
        expect(response.body.description).toBe('This is a test organization');
    });

    it('Read All Organizations: should retrieve all organizations', async () => {
        const response = await request(app.getHttpServer())
            .get('/organization')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].organization_id).toBe(organizationId);
    });

    it('Update Organization: should update the organization details', async () => {
        const updateOrgDto = { name: 'Updated Organization', description: 'Updated description' };

        const response = await request(app.getHttpServer())
            .put(`/organization/${organizationId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateOrgDto);

        expect(response.status).toBe(200);
        expect(response.body.organization_id).toBe(organizationId);
        expect(response.body.name).toBe(updateOrgDto.name);
        expect(response.body.description).toBe(updateOrgDto.description);
    });

    it('Invite User to Organization: should invite a user by email', async () => {
        const inviteUserDto: InviteUserDto = { user_email: 'johndoe@example.com' };

        const response = await request(app.getHttpServer())
            .post(`/organization/${organizationId}/invite`)
            .set('Authorization', `Bearer ${token}`)
            .send(inviteUserDto);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User invited successfully');
    });

    it('Delete Organization: should delete the organization', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/organization/${organizationId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Organization deleted successfully');
    });
});
