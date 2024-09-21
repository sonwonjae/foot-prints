import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { GuestbooksModule } from './guestbooks/guestbooks.module';
import { CheerMailsModule } from './cheer_mails/cheer_mails.module';
import { CheerMailsRepliesModule } from './cheer_mails_replies/cheer_mails_replies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    LocationsModule,
    GuestbooksModule,
    CheerMailsModule,
    CheerMailsRepliesModule,
  ],
})
export class AppModule {}
