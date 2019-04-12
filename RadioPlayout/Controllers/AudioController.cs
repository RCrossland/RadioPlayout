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
using Microsoft.AspNet.Identity;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RadioPlayout.Controllers
{
	[Authorize]
    public class AudioController : Controller
    {
		private ApplicationDbContext _db = new ApplicationDbContext();
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
			string currentAudioMinDuration, string audioMaxDuration, string currentAudioMaxDuration, string audioReleaseYear, string currentAudioYear, int? page)
		{
			// Get user details
			string currentUserId = User.Identity.GetUserId();
			ApplicationUser currentUser = _db.Users.FirstOrDefault(x => x.Id == currentUserId);
			ViewBag.UserName = currentUser.FirstName + " " + currentUser.LastName;

			ViewBag.CurrentSort = sortOrder;
			ViewBag.ArtistNameSortParam = sortOrder == "artist_name" ? "artist_name_desc" : "artist_name";
			ViewBag.AudioTitleSortParam = sortOrder == "audio_title" ? "audio_title_desc" : "audio_title";
			ViewBag.AudioDurationSortParam = sortOrder == "audio_duration" ? "audio_duration_desc" : "audio_duration";

			// If the user has set a new filter go back to page 1
			if(searchString != null || audioType != null || audioMinDuration != null || audioMaxDuration != null || audioReleaseYear != null)
			{
				page = 1;
			}
			else
			{
				searchString = currentSearchString;
				audioType = currentAudioType;
				audioMinDuration = currentAudioMinDuration;
				audioMaxDuration = currentAudioMaxDuration;
				audioReleaseYear = currentAudioYear;
			}

			// Reset the ViewBag values
			ViewBag.currentSearchString = searchString;
			ViewBag.currentAudioType = audioType;
			ViewBag.currentAudioMinDuration = audioMinDuration;
			ViewBag.currentAudioMaxDuration = audioMaxDuration;
			ViewBag.currentAudioYear = audioReleaseYear;

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
			if (!String.IsNullOrWhiteSpace(audioReleaseYear))
			{
				int audioYearInt = Int32.Parse(audioReleaseYear);
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

			// Set Audio Type viewbag
			IEnumerable<SelectListItem> audioTypeList = _db.AudioType.Select(at => new SelectListItem
			{
				Value = at.AudioTypeId.ToString(),
				Text = at.AudioTypeName
			});

			ViewBag.AudioTypeList = audioTypeList;

			int pageSize = 10;
			int pageNumber = (page ?? 1);
            return View(audio.ToPagedList(pageNumber, pageSize));
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
		[ValidateAntiForgeryToken]
		public async Task<ActionResult> AddNewAudioItem(AudioFormViewModel model)
		{
			// Placeholder for errors
			var errors = new List<string>();

			if (ModelState.IsValid)
			{
				// Remove special characters from audioFile
				string audioFile = RemoveSpecialCharacters(model.AudioLocation);

				// Placeholders for the audio upload paths
				string uploadPath = uploadAudioDirectory + audioFile;
				string audioPath = audioDirectory + audioFile;

				// Move the file from Content/Audio/Upload to Content/Audio
				if (System.IO.File.Exists(audioPath) && System.IO.File.Exists(uploadPath))
				{
					// Delete the file from the audio directory
					System.IO.File.Delete(audioPath);
					// Move the new file into the audio directory
					System.IO.File.Move(uploadPath, audioPath);
				}
				else if (!System.IO.File.Exists(audioPath) && System.IO.File.Exists(uploadPath))
				{
					// Move the file from the upload directory to the audio directory
					System.IO.File.Move(uploadPath, audioPath);
				}
				else
				{
					// When the user is adding a new audio file this part of the code should never run.
					// This would only run if the audio is present in /Content/Audio but not in the /Content/Audio/Upload directory
					errors.Add("There was an error with the file upload. Please try again.");
					Response.StatusCode = (int)HttpStatusCode.BadRequest;
					return Json(new { status = "error", errors = errors });
				}

				// Remove all the files in the Upload directory
				System.IO.DirectoryInfo di = new DirectoryInfo(Server.MapPath("~/Content/Audio/Upload/"));
				foreach (FileInfo file in di.GetFiles())
				{
					file.Delete();
				}

				// Convert the inputted time stamps to seconds and return an error if they can't be converted.
				int audioIn = CalculateSeconds(model.AudioIn);
				int audioOut = CalculateSeconds(model.AudioOut);
				int audioDuration = CalculateSeconds(model.AudioDuration);

				if (audioIn == -1 || audioOut == -1 || audioDuration == -1)
				{
					errors.Add("There was an error with the file upload. Please try again.");
					Response.StatusCode = (int)HttpStatusCode.BadRequest;
					return Json(new { status = "error", errors = errors });
				}

				// Get the audio type id
				int audioTypeInt = model.AudioType;
				AudioType audioTypeRef = _db.AudioType.Where(r => r.AudioTypeId.Equals(audioTypeInt)).First();

				Audio newAudio = new Audio
				{
					ArtistName = model.ArtistName,
					AudioTitle = model.AudioTitle,
					AudioLocation = audioFile,
					AudioDuration = audioDuration,
					AudioIn = audioIn,
					AudioOut = audioOut,
					AudioReleaseYear = model.AudioReleaseYear,
					AudioType = audioTypeRef
				};

				_db.Audio.Add(newAudio);
				_db.SaveChanges();

				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}

			// If it gets this far an error has occured
			foreach (var modelStateVal in ViewData.ModelState.Values)
			{
				errors.AddRange(modelStateVal.Errors.Select(error => error.ErrorMessage));
			}
			Response.StatusCode = (int)HttpStatusCode.BadRequest;
			return Json(new { status = "error", errors = errors });
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
		public ActionResult UpdateAudioItem(AudioFormViewModel model)
		{
			// Placeholder for errors
			var errors = new List<string>();

			if (ModelState.IsValid)
			{
				// Remove special characters from the file input
				string audioFile = RemoveSpecialCharacters(model.AudioLocation);

				// Placeholders for the audio upload paths
				string uploadPath = uploadAudioDirectory + audioFile;
				string audioPath = audioDirectory + audioFile;

				// Check whether the audioID exists
				// Placeholder for the audioIDInt

				int audioIdInt = 0;
				if (String.IsNullOrWhiteSpace(model.AudioId.ToString()))
				{
					errorDict.Add("AudioItem", "There was an error updating this audio item. Please try again.");
				}
				else if (!Int32.TryParse(model.AudioId.ToString(), out audioIdInt))
				{
					errorDict.Add("AudioItem", "There was an error updating this audio item. Please try again");
				}

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
				AudioType audioTypeRef = _db.AudioType.Where(r => r.AudioTypeId.Equals(model.AudioType)).First();

				// Convert the inputted time stamps to seconds and return an error if they can't be converted.
				int audioIn = CalculateSeconds(model.AudioIn);
				int audioOut = CalculateSeconds(model.AudioOut);
				int audioDuration = CalculateSeconds(model.AudioDuration);

				if (audioIn == -1 || audioOut == -1 || audioDuration == -1)
				{
					errors.Add("There was an error with the file upload. Please try again.");
					Response.StatusCode = (int)HttpStatusCode.BadRequest;
					return Json(new { status = "error", errors = errors });
				}

				var audioItems = _db.Audio.Where(r => r.AudioId.Equals(audioIdInt));
				foreach (Audio audioItem in audioItems)
				{
					audioItem.ArtistName = model.ArtistName;
					audioItem.AudioTitle = model.AudioTitle;
					audioItem.AudioLocation = audioFile;
					audioItem.AudioDuration = audioDuration;
					audioItem.AudioIn = audioIn;
					audioItem.AudioOut = audioOut;
					audioItem.AudioReleaseYear = model.AudioReleaseYear;
					audioItem.AudioType.AudioTypeId = audioTypeRef.AudioTypeId;
				}
				_db.SaveChanges();

				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}

			// If it gets this far an error has occured
			foreach (var modelStateVal in ViewData.ModelState.Values)
			{
				errors.AddRange(modelStateVal.Errors.Select(error => error.ErrorMessage));
			}
			Response.StatusCode = (int)HttpStatusCode.BadRequest;
			return Json(new { status = "error", errors = errors });
		}

		/// <summary>
		/// Called from a XHR request from a form input file. This will upload the files to /Content/Audio/Upload
		/// </summary>
		/// 
		/// <returns></returns>
		[HttpPost]
		public JsonResult UploadAudioFile()
		{
			if (Request.Files.Count > 0)
			{
				HttpPostedFileBase file = Request.Files[0];
				int fileSize = file.ContentLength;
				string fileName = RemoveSpecialCharacters(file.FileName);
				string mimeType = file.ContentType;
				string filePath = "/Content/Audio/Upload/" + fileName;

				file.SaveAs(Server.MapPath(filePath));

				return Json(filePath, JsonRequestBehavior.AllowGet);
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
			// AudioId placeholder when converting to an int
			int audioIdInt = 0;
			// Validate audio Id
			if (String.IsNullOrWhiteSpace(audioId) || !Int32.TryParse(audioId, out audioIdInt))
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

					// Remove audio file
					System.IO.File.Delete(Request.MapPath("~/Content/Audio/" + audioItem.AudioLocation));
				}
				_db.SaveChanges();

				// Return state code 200
				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}
		}

		/// <summary>
		/// Remove special characters and spaces from the inputted string. 
		/// </summary>
		/// <param name="inputString">String to remove the special characters from.</param>
		/// <returns></returns>
		public string RemoveSpecialCharacters(string inputString)
		{
			return Regex.Replace(inputString, "[^a-zA-Z0-9_.]+", "", RegexOptions.Compiled); ;
		}

		/// <summary>
		/// Convert a time format such as "hh:mm:ss" or "mm:ss" into seconds
		/// </summary>
		/// <param name="formattedTime">The time format to convert.</param>
		/// <returns>Returns a converted time format in seconds. If -1 is returned an error occured.</returns>
		private int CalculateSeconds(string formattedTime)
		{
			string[] splitTime = formattedTime.Split(':');

			// Check splitTime has two or three splits
			if (splitTime.Count() == 2)
			{
				int minutes;
				int seconds;

				// Validate inputs
				if (!Int32.TryParse(splitTime[0], out minutes))
				{
					return -1;
				}
				else if (!Int32.TryParse(splitTime[1], out seconds))
				{
					return -1;
				}


				int minutesToSeconds = minutes * 60;

				return minutes + seconds;
			}
			else if (splitTime.Count() == 3)
			{
				int hours;
				int minutes;
				int seconds;

				if(!Int32.TryParse(splitTime[0], out hours))
				{
					return -1;
				}
				else if(!Int32.TryParse(splitTime[1], out minutes))
				{
					return -1;
				}
				else if (!Int32.TryParse(splitTime[2], out seconds))
				{
					return -1;
				}

				int hourstoSeconds = hours * 3600;
				int minutestoSeconds = minutes * 60;

				return hourstoSeconds + minutestoSeconds + seconds;
			}
			else
			{
				return -1;
			}
		}
	}
}