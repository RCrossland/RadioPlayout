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
					AudioTypeName = "song",
					AudioAverageDuration = "180"
				},
				new Models.AudioType
				{
					AudioTypeName = "jingle",
					AudioAverageDuration = "5"
				},
				new Models.AudioType
				{
					AudioTypeName = "bed",
					AudioAverageDuration = "180"
				},
				new Models.AudioType
				{
					AudioTypeName = "fx",
					AudioAverageDuration = "3"
				}
			);

			context.Audio.AddOrUpdate(r => r.ArtistName,
				new Models.Audio
				{
					ArtistName = "Olly Murs",
					AudioTitle = "Excuses",
					AudioLocation = "/Content/Audio/Olly Murs - Excuses.wav",
					AudioDuration = 246,
					AudioIn = 10,
					AudioOut = 5,
					AudioReleaseYear = 2018
				},
				new Models.Audio
				{
					ArtistName = "Adele",
					AudioTitle = "Hello",
					AudioLocation = "/Content/Audio/Adele - Hello.wav",
					AudioDuration = 30,
					AudioIn = 5,
					AudioOut = 10,
					AudioReleaseYear = 2017
				}
			);
		}
    }
}
