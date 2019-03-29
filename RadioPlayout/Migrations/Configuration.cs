namespace RadioPlayout.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<RadioPlayout.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(RadioPlayout.Models.ApplicationDbContext context)
        {
			//  This method will be called after migrating to the latest version.

			//  You can use the DbSet<T>.AddOrUpdate() helper extension method 
			//  to avoid creating duplicate seed data.
			context.AudioType.AddOrUpdate(r => r.AudioTypeName,
				new Models.AudioType
				{
					AudioTypeId = 1,
					AudioTypeName = "80s Song",
					AudioAverageDuration = "180"
				},
				new Models.AudioType
				{
					AudioTypeId = 2,
					AudioTypeName = "90s Song",
					AudioAverageDuration = "180"
				},
				new Models.AudioType
				{
					AudioTypeId = 3,
					AudioTypeName = "00s Song",
					AudioAverageDuration = "180"
				},
				new Models.AudioType
				{
					AudioTypeId = 4,
					AudioTypeName = "10s Song",
					AudioAverageDuration = "180"
				},
				new Models.AudioType
				{
					AudioTypeId = 5,
					AudioTypeName = "Jingle",
					AudioAverageDuration = "5"
				},
				new Models.AudioType
				{
					AudioTypeId = 6,
					AudioTypeName = "Bed",
					AudioAverageDuration = "180"
				},
				new Models.AudioType
				{
					AudioTypeId = 7,
					AudioTypeName = "FX",
					AudioAverageDuration = "3"
				}
			);
		}
    }
}
