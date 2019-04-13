using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.Net;
using Microsoft.AspNet.Identity;

namespace RadioPlayout.Controllers
{
	[Authorize]
    public class ScheduleController : Controller
    {
		private ApplicationDbContext _db = new ApplicationDbContext();

		// GET: ScheduleClock
		public ActionResult Index()
        {
			// Get user details
			string currentUserId = User.Identity.GetUserId();
			ApplicationUser currentUser = _db.Users.FirstOrDefault(x => x.Id == currentUserId);
			ViewBag.UserName = currentUser.FirstName + " " + currentUser.LastName;

			return View();
        }

		[HttpPost]
		public ActionResult GetAudioType()
		{
			// Select all audio types from the database
			var audioType = _db.AudioType;
			// Return the audio types to the db
			return Json(audioType);
		}

		/// <summary>
		/// Get and return the ScheduleClocks currently in the database.
		/// </summary>
		/// <returns>If any ScheduleClocks were found in the data they'll be returned in a JSON object. Else an error message with be returned.</returns>
		[HttpPost]
		public ActionResult GetExistingScheduleClocks() {
			var existingScheduleClocks = _db.ScheduleClock;

			// If any ScheduleClocks were found return them as a JSON Object
			if (existingScheduleClocks.Any())
			{
				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json(existingScheduleClocks);
			}
			else
			{
				// If no ScheduleClocks were found return a bad request to the user
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json("No schedule clocks were found.");
			}
		}

		[HttpPost]
		public ActionResult GetSpecificScheduleClockItems(string scheduleClockName)
		{
			if (String.IsNullOrWhiteSpace(scheduleClockName))
			{
				// Schedule Clock ID was null
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json("The Schedule Clock name cannot be empty.");
			}
			else
			{
				ScheduleClock existingScheduleClock = _db.ScheduleClock.Where(r => r.ScheduleClockName.Equals(scheduleClockName)).First();

				// If any ScheduleClocks were found return them as a JSON Object
				var existingScheduleClockItems = _db.ScheduleClockItems.Where(r => r.ScheduleClock.ScheduleClockId.Equals(existingScheduleClock.ScheduleClockId)).OrderBy(r => r.ScheduleClockItemIndex);

				if (existingScheduleClockItems.Any())
				{
					Response.StatusCode = (int)HttpStatusCode.OK;
					return Json(existingScheduleClockItems);
				}
				else
				{
					Response.StatusCode = (int)HttpStatusCode.BadRequest;
					return Json("No schedule clock items found.");
				}
			}
		}

		private class ScheduleClockItemInput
		{
			public int schedule_clock_index { get; set; }
			public string schedule_clock_name { get; set; }
		}

		[HttpPost]
		public ActionResult SubmitScheduleClock(string scheduleClockItemInputs, string scheduleClockName, string scheduleClockDuration)
		{
			int scheduleClockDurationInt;
			if(!Int32.TryParse(scheduleClockDuration, out scheduleClockDurationInt))
			{
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json("The schedule clock duration couldn't be converted to an integer.");
			}

			// Parse the JSON string input to a ScheduleClockItemInput object
			ScheduleClockItemInput[] scheduleClockObject = JsonConvert.DeserializeObject<ScheduleClockItemInput[]>(scheduleClockItemInputs);

			// Check whether the name of the clock already exists
			var scheduleClock = _db.ScheduleClock.Where(r => r.ScheduleClockName == scheduleClockName);

			// Placeholder for the Schedule Clock reference
			ScheduleClock scheduleClockDB;
			if (!scheduleClock.Any())
			{
				// The schedule name was not found in the database
				// Add a new item to the ScheduleClock db
				scheduleClockDB = new ScheduleClock
				{
					ScheduleClockName = scheduleClockName,
					ScheduleClockDuration = Int32.Parse(scheduleClockDuration)
				};
				// Add the schedule clock db to the database
				_db.ScheduleClock.Add(scheduleClockDB);
				_db.SaveChanges();
			}
			else
			{
				// The schedule name was found in the database
				// Get a reference to the Schedule Clock 
				scheduleClockDB = _db.ScheduleClock.Where(r => r.ScheduleClockName == scheduleClockName).First();

				// Get the schedule clock items from the database
				var scheduleClockTest = _db.ScheduleClockItems.Where(r => r.ScheduleClock.ScheduleClockId.Equals(scheduleClockDB.ScheduleClockId));
				foreach(var scheduleClockItem in scheduleClockTest)
				{
					// Remove the items from the database
					_db.ScheduleClockItems.Remove(scheduleClockItem);
				}
				// Save the changes
				_db.SaveChanges();
			}

			// Loop over the schedule clock items and add them to the database
			foreach (ScheduleClockItemInput scheduleClockItem in scheduleClockObject)
			{
				// Find audio reference to be used as a foreign key
				AudioType audioType = _db.AudioType.Where(r => r.AudioTypeName == scheduleClockItem.schedule_clock_name).First();

				if (audioType == null)
				{
					Response.StatusCode = (int)HttpStatusCode.BadRequest;
					return Json("scheduleClockDuration");
				}

				ScheduleClockItem scheduleClockItemDB = new ScheduleClockItem
				{
					ScheduleClockItemIndex = scheduleClockItem.schedule_clock_index,
					ScheduleClock = scheduleClockDB,
					AudioType = audioType
				};

				// Add the schedule item to the database
				_db.ScheduleClockItems.Add(scheduleClockItemDB);
				_db.SaveChanges();
			}

			return Json(scheduleClock);
		}

		[HttpPost]
		public ActionResult GenerateScheduleClock(string scheduleClockId)
		{
			// Placeholder for the scheduleAudioItems list that will eventually be returned
			List<Audio> scheduleAudioItems = new List<Audio>();

			// Place holder for the scheduleClockId as an integer
			int scheduleClockIdInt;
			if(!Int32.TryParse(scheduleClockId, out scheduleClockIdInt))
			{
				// The ScheduleClockId couldn't be converted to an integer
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json("The scheduleClockId couldn't be converted to an integer.");
			}

			// Get the scheduleClockItems from the database
			var scheduleClockItems = _db.ScheduleClockItems.Where(c => c.ScheduleClock.ScheduleClockId.Equals(scheduleClockIdInt)).ToList();

			// If any scheduleClockItems were returned
			if (scheduleClockItems.Any())
			{
				foreach (ScheduleClockItem scheduleClockItem in scheduleClockItems)
				{	
					// Get AudioItems from the database based on the scheduleClockItem audio type
					var audioItem = _db.Audio.Where(m => m.AudioType.AudioTypeId.Equals(scheduleClockItem.AudioType.AudioTypeId)).ToList();

					// If an audio item was returned, add a random audioItem to the list
					if (audioItem.Count() > 0)
					{
						var rand = new Random();
						scheduleAudioItems.Add(audioItem[rand.Next(audioItem.Count())]);
					}
				}
			}

			if(scheduleAudioItems.Count() <= 0)
			{
				// No scheduleAudioItems were returned
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json("No schedule clock items were returned.");
			}
			
			return Json(scheduleAudioItems);
		}

		[HttpPost]
		public ActionResult DeleteScheduleClock(string scheduleClockId)
		{
			// Placeholder for any errors
			List<string> errors = new List<String>();

			// Placeholder for schedule id
			int scheduleIdInt;
			if(!Int32.TryParse(scheduleClockId, out scheduleIdInt))
			{
				errors.Add("There was an error deleting the schedule item. Please refresh and try again.");
				Response.StatusCode = (int)HttpStatusCode.BadRequest;
				return Json(new { status = "error", errors = errors });
			}
			else
			{
				// Find and remove the schedule items
				var scheduleClockItems = _db.ScheduleClockItems.Where(m => m.ScheduleClock.ScheduleClockId.Equals(scheduleIdInt));
				foreach(var scheduleClockItem in scheduleClockItems)
				{
					_db.ScheduleClockItems.Remove(scheduleClockItem);
				}
				_db.SaveChanges();

				// Find and remove the schedule clock
				var scheduleClocks = _db.ScheduleClock.Where(m => m.ScheduleClockId.Equals(scheduleIdInt));
				foreach(var scheduleClock in scheduleClocks)
				{
					_db.ScheduleClock.Remove(scheduleClock);
				}
				_db.SaveChanges();

				// Return state code 200
				Response.StatusCode = (int)HttpStatusCode.OK;
				return Json("Success");
			}	
		}
	}
}