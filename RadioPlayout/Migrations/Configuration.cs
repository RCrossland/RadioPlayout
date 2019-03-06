namespace RadioPlayout.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<RadioPlayout.Models.RadioPlayoutDb>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            ContextKey = "RadioPlayout.Models.RadioPlayoutDb";
        }

		protected override void Seed(RadioPlayout.Models.RadioPlayoutDb context)
		{
			//  This method will be called after migrating to the latest version.
			// Set the Audio Type Values
			context.AudioType.AddOrUpdate(r => r.AudioTypeName,
				new Models.AudioType
				{
					AudioTypeName = "song"
				},
				new Models.AudioType
				{
					AudioTypeName = "jingle"
				},
				new Models.AudioType
				{
					AudioTypeName = "bed"
				},
				new Models.AudioType
				{
					AudioTypeName = "fx"
				}
			);

			context.Audio.AddOrUpdate(r => r.ArtistName,
				new Models.Audio {
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
