namespace RadioPlayout.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Audios",
                c => new
                    {
                        AudioId = c.Int(nullable: false, identity: true),
                        ArtistName = c.String(),
                        AudioTitle = c.String(),
                        AudioLocation = c.String(),
                        AudioDuration = c.Int(nullable: false),
                        AudioIn = c.Int(nullable: false),
                        AudioOut = c.Int(nullable: false),
                        AudioReleaseYear = c.Int(nullable: false),
                        AudioType_AudioTypeId = c.Int(),
                    })
                .PrimaryKey(t => t.AudioId)
                .ForeignKey("dbo.AudioTypes", t => t.AudioType_AudioTypeId)
                .Index(t => t.AudioType_AudioTypeId);
            
            CreateTable(
                "dbo.AudioTypes",
                c => new
                    {
                        AudioTypeId = c.Int(nullable: false, identity: true),
                        AudioTypeName = c.String(),
                        AudioAverageDuration = c.String(),
                    })
                .PrimaryKey(t => t.AudioTypeId);
            
            CreateTable(
                "dbo.AspNetRoles",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Name = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.Name, unique: true, name: "RoleNameIndex");
            
            CreateTable(
                "dbo.AspNetUserRoles",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128),
                        RoleId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.UserId, t.RoleId })
                .ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.RoleId);
            
            CreateTable(
                "dbo.Schedules",
                c => new
                    {
                        ScheduleId = c.Int(nullable: false, identity: true),
                        ScheduleDate = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.ScheduleId);
            
            CreateTable(
                "dbo.ScheduleClocks",
                c => new
                    {
                        ScheduleClockId = c.Int(nullable: false, identity: true),
                        ScheduleClockName = c.String(),
                        ScheduleClockDuration = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ScheduleClockId);
            
            CreateTable(
                "dbo.ScheduleClockItems",
                c => new
                    {
                        ScheduleClockItemId = c.Int(nullable: false, identity: true),
                        ScheduleClockItemIndex = c.Int(nullable: false),
                        AudioType_AudioTypeId = c.Int(),
                        ScheduleClock_ScheduleClockId = c.Int(),
                    })
                .PrimaryKey(t => t.ScheduleClockItemId)
                .ForeignKey("dbo.AudioTypes", t => t.AudioType_AudioTypeId)
                .ForeignKey("dbo.ScheduleClocks", t => t.ScheduleClock_ScheduleClockId)
                .Index(t => t.AudioType_AudioTypeId)
                .Index(t => t.ScheduleClock_ScheduleClockId);
            
            CreateTable(
                "dbo.ScheduleItems",
                c => new
                    {
                        ScheduleItemsId = c.Int(nullable: false, identity: true),
                        OrderIndex = c.Int(nullable: false),
                        PlayNextItem = c.Int(nullable: false),
                        Audio_AudioId = c.Int(),
                        Schedule_ScheduleId = c.Int(),
                    })
                .PrimaryKey(t => t.ScheduleItemsId)
                .ForeignKey("dbo.Audios", t => t.Audio_AudioId)
                .ForeignKey("dbo.Schedules", t => t.Schedule_ScheduleId)
                .Index(t => t.Audio_AudioId)
                .Index(t => t.Schedule_ScheduleId);
            
            CreateTable(
                "dbo.AspNetUsers",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        FirstName = c.String(),
                        LastName = c.String(),
                        Email = c.String(maxLength: 256),
                        EmailConfirmed = c.Boolean(nullable: false),
                        PasswordHash = c.String(),
                        SecurityStamp = c.String(),
                        PhoneNumber = c.String(),
                        PhoneNumberConfirmed = c.Boolean(nullable: false),
                        TwoFactorEnabled = c.Boolean(nullable: false),
                        LockoutEndDateUtc = c.DateTime(),
                        LockoutEnabled = c.Boolean(nullable: false),
                        AccessFailedCount = c.Int(nullable: false),
                        UserName = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.UserName, unique: true, name: "UserNameIndex");
            
            CreateTable(
                "dbo.AspNetUserClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.String(nullable: false, maxLength: 128),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.AspNetUserLogins",
                c => new
                    {
                        LoginProvider = c.String(nullable: false, maxLength: 128),
                        ProviderKey = c.String(nullable: false, maxLength: 128),
                        UserId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId })
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserClaims", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.ScheduleItems", "Schedule_ScheduleId", "dbo.Schedules");
            DropForeignKey("dbo.ScheduleItems", "Audio_AudioId", "dbo.Audios");
            DropForeignKey("dbo.ScheduleClockItems", "ScheduleClock_ScheduleClockId", "dbo.ScheduleClocks");
            DropForeignKey("dbo.ScheduleClockItems", "AudioType_AudioTypeId", "dbo.AudioTypes");
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.Audios", "AudioType_AudioTypeId", "dbo.AudioTypes");
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.AspNetUserClaims", new[] { "UserId" });
            DropIndex("dbo.AspNetUsers", "UserNameIndex");
            DropIndex("dbo.ScheduleItems", new[] { "Schedule_ScheduleId" });
            DropIndex("dbo.ScheduleItems", new[] { "Audio_AudioId" });
            DropIndex("dbo.ScheduleClockItems", new[] { "ScheduleClock_ScheduleClockId" });
            DropIndex("dbo.ScheduleClockItems", new[] { "AudioType_AudioTypeId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetRoles", "RoleNameIndex");
            DropIndex("dbo.Audios", new[] { "AudioType_AudioTypeId" });
            DropTable("dbo.AspNetUserLogins");
            DropTable("dbo.AspNetUserClaims");
            DropTable("dbo.AspNetUsers");
            DropTable("dbo.ScheduleItems");
            DropTable("dbo.ScheduleClockItems");
            DropTable("dbo.ScheduleClocks");
            DropTable("dbo.Schedules");
            DropTable("dbo.AspNetUserRoles");
            DropTable("dbo.AspNetRoles");
            DropTable("dbo.AudioTypes");
            DropTable("dbo.Audios");
        }
    }
}
