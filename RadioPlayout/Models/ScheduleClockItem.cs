using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RadioPlayout.Models
{
	public class ScheduleClockItem
	{
		public int ScheduleClockItemId { get; set; }

		public int ScheduleClockItemIndex { get; set; }

		// Foregin key to the ScheduleClock
		public virtual ScheduleClock ScheduleClock { get; set; }

		// Foriegn key to the audio type
		public virtual AudioType AudioType { get; set; }
	}
}