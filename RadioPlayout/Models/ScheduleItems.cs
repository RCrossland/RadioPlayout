using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace RadioPlayout.Models
{
	public class ScheduleItems
	{
		public int ScheduleItemsId { get; set; }

		// Foreign key
		public virtual Schedule Schedule { get; set; }
		// Foreign key
		public virtual Audio Audio { get; set; }
	}
}