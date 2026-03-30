import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Module({
    providers: [
        {
            provide: 'R2_CLIENT',
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const ACCESS_KEY = config.get('ACCESS_KEY')
                const SECRET_ACCESS_KEY_ID = config.get('SECRET_ACCESS_KEY')

                if ( !ACCESS_KEY || !SECRET_ACCESS_KEY_ID ) throw new Error('credentials missing')

                return new S3Client({
                    region: 'auto',
                    endpoint: config.get('ENDPOINT'),
                    credentials: {
                        accessKeyId: ACCESS_KEY,
                        secretAccessKey: SECRET_ACCESS_KEY_ID
                    }
                })
            }
        },
    ],
    exports: ['R2_CLIENT']
})
export class R2Module {}
