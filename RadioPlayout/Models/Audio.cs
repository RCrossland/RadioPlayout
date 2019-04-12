using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

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

	public class AudioFormViewModel
	{
		public int AudioId { get; set; }

		[Required]
		[DataType(DataType.Text)]
		[Display(Name = "Arist Name")]
		public string ArtistName { get; set; }

		[Required]
		[DataType(DataType.Text)]
		[Display(Name = "Audio Title")]
		public string AudioTitle { get; set; }

		[Required]
		[DataType(DataType.Text)]
		[Display(Name = "Audio Location")]
		public string AudioLocation { get; set; }

		[Required]
		[DataType(DataType.Text)]
		[Display(Name = "Audio Duration")]
		public string AudioDuration { get; set; }

		[Required]
		[DataType(DataType.Text)]
		[Display(Name = "Audio Intro")]
		public string AudioIn { get; set; }

		[Required]
		[DataType(DataType.Text)]
		[Display(Name = "Audio Outro")]
		public string AudioOut { get; set; }

		[Required]
		[DataType(DataType.Text)]
		[Display(Name = "Audio Release Year")]
		public int AudioReleaseYear { get; set; }

		[Required]
		[Display(Name = "Audio Type")]
		public int AudioType { get; set; }
	}
}