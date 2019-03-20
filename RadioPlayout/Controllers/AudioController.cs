using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Net;
using System.IO;
using System.Web.Hosting;

namespace RadioPlayout.Controllers
{
	[Authorize]
    public class AudioController : Controller
    {
		private RadioPlayoutDb _db = new RadioPlayoutDb();
		private readonly string uploadAudioDirectory = HostingEnvironment.MapPath("~/Content/Audio/Upload/");
		private readonly string audioDirectory = HostingEnvironment.MapPath("~/Content/Audio/");
		private Dictionary<string, string> errorDict = new Dictionary<string, string>();


		// GET: Audio
		/// <summary>
		/// Index controller of the Audio Items. Passing to the view a filtered version of the AudioItems DB
		/// </summary>
		/// <param name="sortOrder">The current sort parameters.</param>
		/// <param name="searchString">Artist Name or Audio title to search by.</param>
		/// <param name="currentSearchString">Wether a search string has already been inputted.</param>
		/// <param name="audioType">The audio type to search for.</param>
		/// <param name="currentAudioType">Whether an audio type has already been inputted.</param>
		/// <param name="audioMinDuration">The min audio duration to search for.</param>
		/// <param name="currentAudioMinDuration">Whether a min audio duration has already been inputted.</param>
		/// <param name="audioMaxDuration">The max audio duration to search for.</param>
		/// <param name="currentAudioMaxDuration">Whether an audio max duration has already been inputted.</param>
		/// <param name="audioYear">The audio release year to search for.</param>
		/// <param name="currentAudioYear">Whether an audio release year has already been inputted.</param>
		/// <param name="page">The current page of the pagination.</param>
		/// <returns></returns>
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

			int pageSize = 10;
			int pageNumber = (page ?? 1);
            return View(audio.ToPagedList(pageNumber, pageSize));
        }

		/// <summary>
		/// Validate the different Audio Items and add the errors to the global Error dictionary.
		/// </summary>
		/// <param name="artistName">The Artist Name to validate.</param>
		/// <param name="audioTitle">The Audio Title to validate.</param>
		/// <param name="audioLocation">The Audio Location to validate.</param>
		/// <param name="uploadPath">The directory where the audio files are uploaded.</param>
		/// <param name="audioPath">The directory where the validate audio files are kept.</param>
		/// <param name="audioDuration">The Audio Duration to validate.</param>
		/// <param name="audioIn">The Audio In to validate.</param>
		/// <param name="audioOut">The Audio Out to validate.</param>
		/// <param name="audioReleaseYear">The Audio Release Year to validate.</param>
		/// <param name="audioType">The Audio Type to validate.</param>
		public void ValidateAudioItems(string artistName, string audioTitle, string audioLocation, string uploadPath, string audioPath, 
			string audioDuration, string audioIn, string audioOut, string audioReleaseYear, string audioType)
		{
			// Reference to an invlid integer value
			int integerReference;

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
			else if (!System.IO.File.Exists(uploadPath))
			{
				if (!System.IO.File.Exists(audioPath))
				{
					// Audio is not in the /Content/Audio/Upload
					errorDict.Add("AudioLocation", "The audio file has not been uploaded, please try again");
				}
			}

			// Validate the audio duration
				if (String.IsNullOrWhiteSpace(audioDuration))
			{
				// Audio duration doesn't have a value
				errorDict.Add("AudioDuration", "The audio duration cannot be empty.");
			}
			else if (!Int32.TryParse(audioDuration, out integerReference))
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
			else if (!Int32.TryParse(audioIn, out integerReference))
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
			else if (!Int32.TryParse(audioOut, out integerReference))
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
			else if (!Int32.TryParse(audioReleaseYear, out integerReference))
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
			else if (!Int32.TryParse(audioType, out integerReference))
			{
				// Audio type couldn't be converted to an integer
				errorDict.Add("AudioType", "The audio type couldn't be converted to an integer");
			}
		}

		/// <summary>
		/// Add a new Audio Item to the Audio DB. The items will each be validated first and then added to the database.
		/// If the validate throws an errors a Json object will be returned with the error.
		/// </summary>
		/// <param name="artistName">The Artist Name.</param>
		/// <param name="audioTitle">The Audio Title.</param>
		/// <param name="audioLocation">Where the directory where the audio item has been uploaded to.</param>
		/// <param name="audioDuration">The duration of the audio item. This will be converted to an integer.</param>
		/// <param name="audioIn">Where audio item intro has ended. This will be converted to an integer.</param>
		/// <param name="audioOut">Where the audio item has ended. This will be converted to an integer.</param>
		/// <param name="audioReleaseYear">The century that the audio item was released. This will be converted to an integer.</param>
		/// <param name="audioType">The audio type id of the audio item. This will be converted to an integer.</param>
		/// <returns>A Json object with '200' if the audio item was successfully added.</returns>
		[HttpPost]
		public ActionResult AddNewAudioItem(string artistName, string audioTitle, string audioLocation, string audioDuration,
			string audioIn, string audioOut, string audioReleaseYear, string audioType)
		{
			errorDict.Clear();

			// Placeholders for the audio upload paths
			string uploadPath = uploadAudioDirectory + audioLocation;
			string audioPath = audioDirectory + audioLocation;

			// Dictionary to hold key value error pairs
			ValidateAudioItems(artistName, audioTitle, audioLocation, uploadPath, audioPath, audioDuration, audioIn, audioOut, audioReleaseYear, audioType);

			if (errorDict.Count > 0)
			{
				// The validation brought up errors. Do NOT add the audio item
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json(errorDict);
			}
			else
			{
				// No errors were produced. The audio can be added
				// Move the file from Content/Audio/Upload to Content/Audio
				if (System.IO.File.Exists(audioPath) && System.IO.File.Exists(uploadPath))
				{
					// Delete the file from the audio directory
					System.IO.File.Delete(audioPath);
					// Move the new file into the audio directory
					System.IO.File.Move(uploadPath, audioPath);
				}
				else if(!System.IO.File.Exists(audioPath) && System.IO.File.Exists(uploadPath))
				{
					// Move the file from the upload directory to the audio directory
					System.IO.File.Move(uploadPath, audioPath);
				}
				else
				{
					// When the user is adding a new audio file this part of the code should next run.
					// This would only run if the audio is present in /Content/Audio but not in the /Content/Audio/Upload directory
					Response.StatusCode = (int)HttpStatusCode.BadRequest;
					errorDict.Add("Audio", "There wasn an error with the file upload. Please try again");
				}

				// Remove all the files in the Upload directory
				System.IO.DirectoryInfo di = new DirectoryInfo(Server.MapPath("~/Content/Audio/Upload/"));
				foreach (FileInfo file in di.GetFiles())
				{
					file.Delete();
				}

				// Get the audio type id
				int audioTypeInt = Int32.Parse(audioType);
				AudioType audioTypeRef = _db.AudioType.Where(r => r.AudioTypeId.Equals(audioTypeInt)).First();

				Audio newAudio = new Audio
				{
					ArtistName = artistName,
					AudioTitle = audioTitle,
					AudioLocation = "Content/Audio/" + audioLocation,
					AudioDuration = Int32.Parse(audioDuration),
					AudioIn = Int32.Parse(audioIn),
					AudioOut = Int32.Parse(audioOut),
					AudioReleaseYear = Int32.Parse(audioReleaseYear),
					AudioType = audioTypeRef
				};

				_db.Audio.Add(newAudio);
				_db.SaveChanges();

				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}
		}

		/// <summary>
		/// Update an audio item in the database
		/// </summary>
		/// <param name="audioId">The AudioId of the item to change.</param>
		/// <param name="artistName">The new Artist Name of the audio item.</param>
		/// <param name="audioTitle">The new Audio Title of the audio item.</param>
		/// <param name="audioLocation">The new direction where the new audio item has been uploaded to.</param>
		/// <param name="audioDuration">The new audio duration of of the audio item.</param>
		/// <param name="audioIn">The new time where the audio intro has ended for the new audio item.</param>
		/// <param name="audioOut">The new time where the audio has ended for the audio item.</param>
		/// <param name="audioReleaseYear">The new audio release year for the audio item.</param>
		/// <param name="audioType">The new audio type id for the audio item.</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult UpdateAudioItem(string audioId, string artistName, string audioTitle, string audioLocation, string audioDuration,
			string audioIn, string audioOut, string audioReleaseYear, string audioType)
		{
			errorDict.Clear();

			// Placeholders for the audio upload paths
			string uploadPath = uploadAudioDirectory + audioLocation;
			string audioPath = audioDirectory + audioLocation;

			// Dictionary to hold key value error pairs
			ValidateAudioItems(artistName, audioTitle, audioLocation, uploadPath, audioPath, audioDuration, audioIn, audioOut, audioReleaseYear, audioType);

			// Check whether the audioID exists
			// Placeholder for the audioIDInt
			int audioIdInt = 0;
			if (String.IsNullOrWhiteSpace(audioId))
			{
				errorDict.Add("AudioItem", "There was an error updating this audio item. Please try again.");
			}
			else if(!Int32.TryParse(audioId, out audioIdInt))
			{
				errorDict.Add("AudioItem", "There was an error updating this audio item. Please try again");
			}

			if (errorDict.Count > 0)
			{
				// The validation brought up errors. Do NOT Update the audio item
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json(errorDict);
			}
			else
			{
				// Move the file from /Content/Audio/Upload to Content/Audio
				if (System.IO.File.Exists(uploadPath))
				{
					// If the file is in uploadPath. Check whether it exists in the /Content/Audio directory
					if (!System.IO.File.Exists(audioPath))
					{
						System.IO.File.Move(uploadPath, audioPath);
					}
				}

				// Remove all the files in the Upload directory
				System.IO.DirectoryInfo di = new DirectoryInfo(uploadAudioDirectory);
				foreach (FileInfo file in di.GetFiles())
				{
					file.Delete();
				}

				// Get the audio type id
				int audioTypeIdInt = Int32.Parse(audioType);
				AudioType audioTypeRef = _db.AudioType.Where(r => r.AudioTypeId.Equals(audioTypeIdInt)).First();

				var audioItems = _db.Audio.Where(r => r.AudioId.Equals(audioIdInt));
				foreach(Audio audioItem in audioItems)
				{
					audioItem.ArtistName = artistName;
					audioItem.AudioTitle = audioTitle;
					audioItem.AudioLocation = "/Content/Audio/" + audioLocation;
					audioItem.AudioDuration = Int32.Parse(audioDuration);
					audioItem.AudioIn = Int32.Parse(audioIn);
					audioItem.AudioOut = Int32.Parse(audioOut);
					audioItem.AudioReleaseYear = Int32.Parse(audioReleaseYear);
					audioItem.AudioType.AudioTypeId = audioTypeRef.AudioTypeId;
				}
				_db.SaveChanges();

				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}
		}

		/// <summary>
		/// Called from a XHR request from a form input file. This will upload the files to /Content/Audio/Upload
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public ActionResult UploadAudioFile()
		{
			if (Request.Files.Count > 0)
			{
				HttpPostedFileBase file = Request.Files[0];
				int fileSize = file.ContentLength;
				string fileName = file.FileName;
				string mimeType = file.ContentType;
				string filePath = "/Content/Audio/Upload/" + fileName;

				file.SaveAs(Server.MapPath(filePath));

				return Json(filePath);
			}
			else
			{
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json("Invalid File Upload");
			}
		}

		/// <summary>
		/// Get the Audio Item info from the Audio DB for a given audioId
		/// </summary>
		/// <param name="audioId">The AudioId to search for. This will be converted to an integer.</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult GetAudioItemInfo(string audioId)
		{
			int audioIdInt = 0;
			if(!Int32.TryParse(audioId, out audioIdInt))
			{
				errorDict.Add("Audio", "There wasn an error with the file upload. Please try again");
			}

			var audioItem = _db.Audio.Where(r => r.AudioId.Equals(audioIdInt));

			return Json(audioItem);
		}

		/// <summary>
		/// Delete a specified audio item from that Audio database.
		/// </summary>
		/// <param name="audioId">The AudioId of the item that needs to be deleted</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DeleteAudioItem(string audioId)
		{
			errorDict.Clear();
			// AudioId placeholder when converting to an int
			int audioIdInt = 0;
			// Validate audio Id
			if (String.IsNullOrWhiteSpace(audioId))
			{
				errorDict.Add("AudioItem", "There was an error deleting this audio item.");
			}
			else if(!Int32.TryParse(audioId, out audioIdInt))
			{
				errorDict.Add("AudioItem", "There was an error deleting this audio item");
			}
			
			// Check whether any errors occured
			if(errorDict.Count > 0)
			{
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json(errorDict);
			}
			else
			{
				// Remove the audio item based on the audioIdInt
				var audioItems = _db.Audio.Where(r => r.AudioId.Equals(audioIdInt));
				foreach (var audioItem in audioItems)
				{
					_db.Audio.Remove(audioItem);
				}
				_db.SaveChanges();

				// Return state code 200
				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}
		}
	}
}