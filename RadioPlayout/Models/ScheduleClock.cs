using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RadioPlayout.Models
{
	public class ScheduleClock
	{
		public int ScheduleClockId { get; set; }
		public string ScheduleClockName { get; set; }
		public int ScheduleClockDuration { get; set; }
	}
}