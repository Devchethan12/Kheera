import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { compare, hash } from 'bcrypt';
import { BloomFilter } from 'bloom-filters';
import { AuthDTO } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private emailFilter: BloomFilter;

  constructor(
    @InjectRepository(AuthEntity)
    private authRepo: Repository<AuthEntity>,
    private readonly jwtService: JwtService,
  ) {
    this.emailFilter = new BloomFilter(1000, 1);
  }

  async onModuleInit() {
    const users = await this.authRepo.find({ select: ['email'] });
    users.forEach((user) => this.emailFilter.add(user.email));
  }

  async signup(authService: AuthDto) {
    try {
      const { error } = AuthDTO.validate(authService, { abortEarly: false });

      if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, ''));
        throw new ConflictException(messages.join(', '));
      }

      const { email, password, username } = authService;

      if (this.emailFilter.has(email)) {
        const existingUser = await this.authRepo.findOne({ where: { email } });
        if (existingUser) {
          throw new ConflictException(
            'User already exists with the given email!',
          );
        }
      }

      const hashedPassword = await hash(password, 10);
      const user = this.authRepo.create({
        email,
        password: hashedPassword,
        username,
      });

      await this.authRepo.save(user);
      this.emailFilter.add(email);
      return {
        message: 'User created successfully!',
      };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Something went wrong during signup.',
      );
    }
  }

  async getUsers() {
    return await this.authRepo.find({
      select: ['email', 'password', 'username'],
    });
  }

  async login(authService: AuthDto) {
    const { email, password } = authService;

    const user = await this.authRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      username: user.username,
      email: user.email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    return {
      accessToken: token,
      expiresIn: 3600,
      username: user.username,
      email: user.email,
    };
  }
}
