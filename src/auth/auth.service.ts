import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';



@Injectable()
export class AuthService {
    private readonly redis: Redis | null;
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private jwtService: JwtService,
        private readonly redisService: RedisService
    ){
        this.redis = this.redisService.getOrThrow();
    }
    async signup(signupData: SignupDto){
        const {name, email, password} = signupData;
        const emailInUse = await this.UserModel.findOne({
            email: email
        });
        if(emailInUse){
            throw new BadRequestException("Email already in use");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.UserModel.create({
            name,
            email,
            password: hashedPassword
        });
        return {message: "User added successfully"};
    }
    async login(credentials: LoginDto) {
        const { email, password } = credentials;
        //Find if user exists by email
        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Wrong credentials');
        }

        //Compare entered password with existing password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Wrong credentials');
        }

        //Generate JWT tokens
        const tokens = await this.generateUserTokens(user._id);
        return {
            message: "Login Successfully",
            ...tokens,
        };
    }

    async generateUserTokens(userId) {
        const access_token = this.jwtService.sign({ userId }, { expiresIn: '5h' });
        
        const refresh_token = uuidv4();
        
        await this.redis.set(refresh_token, userId, 'EX', 7 * 24 * 60 * 60);
        
        return {
            access_token,
            refresh_token,
        };
    }

      // Validate and refresh tokens
    async refreshTokens(refresh_token: string) {
        const userId = await this.redis.get(refresh_token);

        if (!userId) {
             throw new UnauthorizedException('Invalid refresh token');
        }
        
        const access_token = this.jwtService.sign({ userId }, { expiresIn: '5h' });

        
        return {
            message: "Refresh Token Successfully",
            access_token,
            refresh_token
        };
    }

    async revokeToken(refreshToken: string) {
        await this.redis.del(refreshToken);
        return {message: "Refresh Token Revoked Successfully"}
    }

    async findUserById(userId: string){
        return await this.UserModel.findById(userId);
    }

    async findByEmail(email: string){
        return await this.UserModel.findOne({ email });
    }
}
