using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RadioPlayout.Models
{
	public class Audio
	{
		public int AudioId { get; set; }
		public string ArtistName { get; set; }
		public string AudioTitle { get; set; }
		public string AudioLocation { get; set; }

		public int AudioDuration { get; set; }
		public int AudioIn { get; set; }
		public int AudioOut { get; set; }

		public int AudioReleaseYear { get; set; }

		// Foreign Key
		public virtual AudioType AudioType { get; set; }
	}
}