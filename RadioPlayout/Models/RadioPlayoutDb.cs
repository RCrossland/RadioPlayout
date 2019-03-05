using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;

namespace RadioPlayout.Models
{
	public class RadioPlayoutDb : DbContext
	{
		public RadioPlayoutDb() : base("name=DefaultConnection")
		{
		}

		public DbSet<Schedule> Schedule { get; set; }
		public DbSet<AudioType> AudioType { get; set; }
		public DbSet<Audio> Audio { get; set; }
		public DbSet<ScheduleItems> ScheduleItems { get; set; }
	}
}