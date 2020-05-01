def handle_command(slack_api, command, channel):
    """
    Recieves commands directed for the bot, if they are valid perform action 
    else resends clarification
    """
    EXAMPLE_COMMAND = 'do'
    if command.lower().startswith(EXAMPLE_COMMAND) or command.lower().startswith('what'):
        slack_api.rtm_send_message(channel, 'Yes, code me further to do that!')
    elif command.lower().startswith('hi') or command.lower().startswith('hey') or command.lower().startswith('hello') or command.lower().startswith('who are you'):
        slack_api.rtm_send_message(channel, 'Hey, I\'m your slack bot, how may I help you?')
    else:
        print 'Invalid Command: Not Understood'
    slack_api.rtm_send_message(channel, 'Invalid Command: Not Understood')