process.env.SECRET_JWT_SEED = 'test-secret-seed';

const request = require('supertest');
const app = require('../index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mockear el modelo Usuario
jest.mock('../models/Usuario', () => {
    const Usuario = jest.fn().mockImplementation((data) => {
        return {
            ...data,
            _id: 'newUserId', // Simulate Mongoose generating an _id
            save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
        };
    });
    Usuario.findOne = jest.fn();
    Usuario.create = jest.fn();
    return Usuario;
});

const Usuario = require('../models/Usuario');

// Mockear la conexión a la base de datos
jest.mock('../database/config', () => ({
    dbConnection: jest.fn().mockResolvedValue(true),
}));

// Mockear bcryptjs
jest.mock('bcryptjs', () => ({
    compareSync: jest.fn(),
    genSaltSync: jest.fn(),
    hashSync: jest.fn(),
}));

// Mockear jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe('Auth Endpoints', () => {
    let mockUserRenew;

    beforeEach(() => {
        // Limpiar mocks antes de cada test
        jest.clearAllMocks();
        // Mockear process.env.SECRET_JWT_SEED
        process.env.SECRET_JWT_SEED = 'test-secret-seed';

        mockUserRenew = {
            _id: 'someUserId',
            name: 'Test User',
            email: 'test@test.com'
        };
    });

    test('should return 400 if name is not provided for /api/auth/new', async () => {
        const res = await request(app)
            .post('/api/auth/new')
            .send({
                email: 'test@test.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors.name.msg).toEqual('El nombre es obligatorio');
    });

    test('should register user successfully with /api/auth/new', async () => {
        const mockUser = {
            _id: 'newUserId',
            name: 'New User',
            email: 'new@test.com',
            password: 'hashedPassword'
        };

        Usuario.findOne.mockResolvedValue(null); // User does not exist
        Usuario.create.mockResolvedValue(mockUser); // User created
        bcrypt.genSaltSync.mockReturnValue('mockSalt');
        bcrypt.hashSync.mockReturnValue('hashedPassword');
        jwt.sign.mockReturnValue('mockNewToken');

        const res = await request(app)
            .post('/api/auth/new')
            .send({
                name: 'New User',
                email: 'new@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.uid).toEqual(mockUser._id);
        expect(res.body.name).toEqual(mockUser.name);
        expect(res.body.token).toEqual('mockNewToken');
    }, 10000);

    test('should login user successfully with /api/auth', async () => {
        const mockUser = {
            _id: 'someUserId',
            name: 'Test User',
            email: 'test@test.com',
            password: 'hashedPassword'
        };

        // Mockear Usuario.findOne
        Usuario.findOne.mockResolvedValue(mockUser);
        // Mockear bcrypt.compareSync
        bcrypt.compareSync.mockReturnValue(true);
        // Mockear jwt.sign
        jwt.sign.mockReturnValue('mockToken');

        const res = await request(app)
            .post('/api/auth')
            .send({
                email: 'test@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.uid).toEqual(mockUser._id);
        expect(res.body.name).toEqual(mockUser.name);
        expect(res.body.token).toEqual('mockToken');
    });

    test('should return 400 if user does not exist for /api/auth', async () => {
        Usuario.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth')
            .send({
                email: 'nonexistent@test.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toEqual('El usuario no existe con ese email');
    });

    test('should return 400 for incorrect password with /api/auth', async () => {
        Usuario.findOne.mockResolvedValue({
            email: 'test@test.com',
            password: 'hashedPassword'
        });
        bcrypt.compareSync.mockReturnValue(false);

        const res = await request(app)
            .post('/api/auth')
            .send({
                email: 'test@test.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toEqual('Password incorrecto');
    });

    test('should renew token successfully with /api/auth/renew', async () => {
        const mockToken = 'validToken';

        // Mockear jwt.verify
        jwt.verify.mockReturnValue({ u_id: mockUserRenew._id, name: mockUserRenew.name });
        // Mockear jwt.sign
        jwt.sign.mockReturnValue('newMockToken');

        const res = await request(app)
            .get('/api/auth/renew')
            .set('x-token', mockToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.uid).toEqual(mockUserRenew._id);
        expect(res.body.name).toEqual(mockUserRenew.name);
        expect(res.body.token).toEqual('newMockToken');
    });

    test('should return 401 for invalid token with /api/auth/renew', async () => {
        // Mockear jwt.verify para que falle
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid Token'), null);
        });

        const res = await request(app)
            .get('/api/auth/renew')
            .set('x-token', 'invalidToken');

        expect(res.statusCode).toEqual(401);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toEqual('Token no valido');
    });
});
