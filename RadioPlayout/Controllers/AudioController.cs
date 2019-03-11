using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Net;
using System.IO;

namespace RadioPlayout.Controllers
{
    public class AudioController : Controller
    {
		private RadioPlayoutDb _db = new RadioPlayoutDb();

		// GET: Audio
		public ViewResult Index(string sortOrder, string searchString, string currentSearchString, string audioType, string currentAudioType, string audioMinDuration, 
			string currentAudioMinDuration, string audioMaxDuration, string currentAudioMaxDuration, string audioYear, string currentAudioYear, int? page)
        {
			ViewBag.CurrentSort = sortOrder;
			ViewBag.ArtistNameSortParam = sortOrder == "artist_name" ? "artist_name_desc" : "artist_name";
			ViewBag.AudioTitleSortParam = sortOrder == "audio_title" ? "audio_title_desc" : "audio_title";
			ViewBag.AudioDurationSortParam = sortOrder == "audio_duration" ? "audio_duration_desc" : "audio_duration";

			// If the user has set a new filter go back to page 1
			if(searchString != null || audioType != null || audioMinDuration != null || audioMaxDuration != null || audioYear != null)
			{
				page = 1;
			}
			else
			{
				searchString = currentSearchString;
				audioType = currentAudioType;
				audioMinDuration = currentAudioMinDuration;
				audioMaxDuration = currentAudioMaxDuration;
				audioYear = currentAudioYear;
			}

			// Reset the ViewBag values
			ViewBag.currentSearchString = searchString;
			ViewBag.currentAudioType = audioType;
			ViewBag.currentAudioMinDuration = audioMinDuration;
			ViewBag.currentAudioMaxDuration = audioMaxDuration;
			ViewBag.currentAudioYear = audioYear;

			IQueryable<Audio> audio = _db.Audio;

			// Sort the audio items based on the searchString
			if (!String.IsNullOrWhiteSpace(searchString))
			{
				audio = audio.Where(r => r.ArtistName.Contains(searchString) || r.AudioTitle.Contains(searchString));
			}

			// Sort the audio items based on the audioType
			if (!String.IsNullOrWhiteSpace(audioType))
			{
				int audioTypeInt = Int32.Parse(audioType);
				audio = audio.Where(r => r.AudioType.AudioTypeId.Equals(audioTypeInt));
			}

			// Sort the audio items based on the minimum audio duration
			if (!String.IsNullOrWhiteSpace(audioMinDuration))
			{
				int audioMinDurationInt = Int32.Parse(audioMinDuration);
				audio = audio.Where(r => r.AudioDuration >= audioMinDurationInt);
			}

			// Sort the audio items based on the maximum audio duration
			if (!String.IsNullOrWhiteSpace(audioMaxDuration))
			{
				int audioMaxDurationInt = Int32.Parse(audioMaxDuration);
				audio = audio.Where(r => r.AudioDuration <= audioMaxDurationInt);
			}

			// Sort the audio items based on the release year
			if (!String.IsNullOrWhiteSpace(audioYear))
			{
				int audioYearInt = Int32.Parse(audioYear);
				audio = audio.Where(r => r.AudioReleaseYear.Equals(audioYearInt));
			}

			// Sort the audio items based on the user input
			switch (sortOrder)
			{
				case "artist_name":
					audio = audio.OrderBy(r => r.ArtistName);
					break;
				case "artist_name_desc":
					audio = audio.OrderByDescending(r => r.ArtistName);
					break;
				case "audio_title":
					audio = audio.OrderBy(r => r.AudioTitle);
					break;
				case "audio_title_desc":
					audio = audio.OrderByDescending(r => r.AudioTitle);
					break;
				case "audio_duration":
					audio = audio.OrderBy(r => r.AudioDuration);
					break;
				case "audio_duration_desc":
					audio = audio.OrderByDescending(r => r.AudioDuration);
					break; 
				default:
					audio = audio.OrderBy(r => r.ArtistName);
					break;
			}

			ViewBag.AudioCount = audio.Count();

			int pageSize = 1;
			int pageNumber = (page ?? 1);
            return View(audio.ToPagedList(pageNumber, pageSize));
        }

		[HttpPost]
		public ActionResult AddNewAudioItem(string artistName, string audioTitle, string audioLocation, string audioDuration,
			string audioIn, string audioOut, string audioReleaseYear, string audioType)
		{
			// Placeholders when converting the timings strings to integers
			int audioDurationInt = 0;
			int audioInInt = 0;
			int audioOutInt = 0;
			int audioReleaseYearInt = 0;
			int audioTypeInt = 0;
			string uploadPath = Server.MapPath("~/Content/Audio/Upload/" + audioLocation);
			string audioPath = Server.MapPath("~/Content/Audio/" + audioLocation);

			// Dictionary to hold key value error pairs
			Dictionary<string, string> errorDict = new Dictionary<string, string>();

			// Validate the inputted values
			// Validate the artist name
			if (String.IsNullOrWhiteSpace(artistName))
			{
				// Artist name doesn't have a value
				errorDict.Add("ArtistName", "The artist name cannot be empty.");
			}

			// Validate the audio title
			if (string.IsNullOrWhiteSpace(audioTitle))
			{
				// Audio title doesn't have a value
				errorDict.Add("AudioTitle", "The audio title cannot be empty.");
			}

			// Validate the audio location
			if (String.IsNullOrWhiteSpace(audioLocation))
			{
				// Audio location doesn't have a value
				errorDict.Add("AudioLocation", "The audio location cannot be empty.");
			}
			else if(!System.IO.File.Exists(uploadPath))
			{
				// Audio is not in the default upload directory
				errorDict.Add("AudioLocation", "The audio file has not been uploaded, please try again");
			}

			// Validate the audio duration
			if (String.IsNullOrWhiteSpace(audioDuration))
			{
				// Audio duration doesn't have a value
				errorDict.Add("AudioDuration", "The audio duration cannot be empty.");
			}
			else if(!Int32.TryParse(audioDuration, out audioDurationInt))
			{
				// Audio Duration couldn't be converted to an integer
				errorDict.Add("AudioDuration", "The audio duration couldn't be converted to an integer");
			}

			// Validate the audio in
			if (String.IsNullOrWhiteSpace(audioIn))
			{
				// Audio in doesn't have a value
				errorDict.Add("AudioIn", "The audio in cannot be empty");
			}
			else if(!Int32.TryParse(audioIn, out audioInInt))
			{
				// Audio in couldn't be converted to an integer
				errorDict.Add("AudioIn", "The audio in couldn't be converted to an integer");
			}

			// Vaidate the audio out
			if (String.IsNullOrWhiteSpace(audioOut))
			{
				// Audio out doesn't have a value
				errorDict.Add("AudioOut", "The audio out cannot be empty.");
			}
			else if(!Int32.TryParse(audioOut, out audioOutInt))
			{
				// Audio out couldn't be converted to an integer
				errorDict.Add("AudioOut", "The audio out couldn't be converted to an integer.");
			}

			// Validate the release year
			if (String.IsNullOrWhiteSpace(audioReleaseYear))
			{
				// Audio release year doesn't have a value
				errorDict.Add("AudioReleaseYear", "The audio release year cannot be empty");
			}
			else if(!Int32.TryParse(audioReleaseYear, out audioReleaseYearInt))
			{
				// Audio release year couldn't be converted to an integer
				errorDict.Add("AudioReleaseYear", "The audio release year couldn't be converted to an integer.");
			}

			// Validate the audio type
			if (String.IsNullOrWhiteSpace(audioType))
			{
				// Audio type doesn't have a value
				errorDict.Add("AudioType", "THe audio type cannot be empty.");
			}
			else if(!Int32.TryParse(audioType, out audioTypeInt))
			{
				// Audio type couldn't be converted to an integer
				errorDict.Add("AudioType", "The audio type couldn't be converted to an integer");
			}


			if (errorDict.Count > 0)
			{
				// The validation brought up errors. Do NOT add the audio item
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json(errorDict);
			}
			else
			{
				// Move the file from Content/Audio/Upload to Content/Audio
				if (System.IO.File.Exists(audioPath))
				{
					System.IO.File.Delete(audioPath);
				}
				System.IO.File.Move(uploadPath, audioPath);

				// Remove all the files in the Upload directory
				System.IO.DirectoryInfo di = new DirectoryInfo(Server.MapPath("~/Content/Audio/Upload/"));
				foreach (FileInfo file in di.GetFiles())
				{
					file.Delete();
				}

				// Get the audio type id
				AudioType audioTypeRef = _db.AudioType.Where(r => r.AudioTypeId.Equals(audioTypeInt)).First();

				// No errors were produced. The audio can be added
				Audio newAudio = new Audio
				{
					ArtistName = artistName,
					AudioTitle = audioTitle,
					AudioLocation = "Content/Audio/" + audioLocation,
					AudioDuration = audioDurationInt,
					AudioIn = audioInInt,
					AudioOut = audioOutInt,
					AudioReleaseYear = audioReleaseYearInt,
					AudioType = audioTypeRef
				};

				_db.Audio.Add(newAudio);
				_db.SaveChanges();

				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}
		}

		[HttpPost]
		public ActionResult UploadAudioFile()
		{
			HttpPostedFileBase file = Request.Files[0];
			int fileSize = file.ContentLength;
			string fileName = file.FileName;
			string mimeType = file.ContentType;
			string filePath = "/Content/Audio/Upload/" + fileName;

			file.SaveAs(Server.MapPath(filePath));

			return Json(filePath);
		}

		[HttpPost]
		public ActionResult UpdateAudioItem()
		{
			return Json("", JsonRequestBehavior.AllowGet);
		}

	}
}