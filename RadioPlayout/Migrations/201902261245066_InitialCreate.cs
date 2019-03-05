namespace RadioPlayout.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialCreate : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Audios",
                c => new
                    {
                        AudioId = c.Int(nullable: false, identity: true),
                        ArtistName = c.String(),
                        TrackTitle = c.String(),
                        TrackLocation = c.String(),
                        TrackDuration = c.Int(nullable: false),
                        TrackIn = c.Int(nullable: false),
                        TrackOut = c.Int(nullable: false),
                        ScheduleItem_ScheduleItemId = c.Int(),
                    })
                .PrimaryKey(t => t.AudioId)
                .ForeignKey("dbo.ScheduleItems", t => t.ScheduleItem_ScheduleItemId)
                .Index(t => t.ScheduleItem_ScheduleItemId);
            
            CreateTable(
                "dbo.Schedules",
                c => new
                    {
                        ScheduleId = c.Int(nullable: false, identity: true),
                        ScheduleDate = c.DateTime(nullable: false),
                        ScheduleItem_ScheduleItemId = c.Int(),
                    })
                .PrimaryKey(t => t.ScheduleId)
                .ForeignKey("dbo.ScheduleItems", t => t.ScheduleItem_ScheduleItemId)
                .Index(t => t.ScheduleItem_ScheduleItemId);
            
            CreateTable(
                "dbo.ScheduleItems",
                c => new
                    {
                        ScheduleItemId = c.Int(nullable: false, identity: true),
                    })
                .PrimaryKey(t => t.ScheduleItemId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Schedules", "ScheduleItem_ScheduleItemId", "dbo.ScheduleItems");
            DropForeignKey("dbo.Audios", "ScheduleItem_ScheduleItemId", "dbo.ScheduleItems");
            DropIndex("dbo.Schedules", new[] { "ScheduleItem_ScheduleItemId" });
            DropIndex("dbo.Audios", new[] { "ScheduleItem_ScheduleItemId" });
            DropTable("dbo.ScheduleItems");
            DropTable("dbo.Schedules");
            DropTable("dbo.Audios");
        }
    }
}
